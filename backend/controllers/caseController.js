const Case = require('../models/Case');
const Response = require('../models/Response');
const { analyzeCase } = require('../services/aiService');

exports.createCase = async (req, res) => {
  try {
    const { patientName, age, gender, symptoms, temperature, bloodPressure, heartRate, history } = req.body;

    console.log('[CreateCase] Received body:', req.body);
    console.log('[CreateCase] Received files:', req.files?.length || 0);

    const attachments = req.files ? req.files.map(file => ({
      filename: file.filename,
      path: `uploads/${file.filename}`,
      mimetype: file.mimetype
    })) : [];

    // Call AI to get immediate preliminary analysis
    const aiAnalysis = await analyzeCase({
      patientName, age, gender, symptoms,
      temperature, bloodPressure, heartRate, history,
      attachments
    });

    console.log('[CreateCase] AI Analysis result:', aiAnalysis);

    const newCase = new Case({
      patientName,
      age: age ? Number(age) : undefined,
      gender,
      symptoms,
      temperature: temperature ? Number(temperature) : undefined,
      bloodPressure,
      heartRate: heartRate ? Number(heartRate) : undefined,
      history,
      attachments,
      aiAnalysis,
      createdBy: req.user._id
    });

    const savedCase = await newCase.save();
    const populatedCase = await Case.findById(savedCase._id).populate('createdBy', 'name email');
    
    // Broadcast event to notify users (like specialists)
    if (req.io) {
      req.io.emit('case_created', populatedCase);
    }
    
    res.status(201).json(populatedCase);
  } catch (err) {
    console.error('[CreateCase] ERROR:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.getCases = async (req, res) => {
  try {
    let filter = {};
    if (req.user.role === 'worker') {
      filter.createdBy = req.user._id;
    } else if (req.user.role === 'specialist') {
      // Specialists can see escalated cases or cases explicitly assigned to them
      filter.$or = [{ status: 'escalated' }, { status: 'under_review' }, { assignedSpecialist: req.user._id }];
    }
    
    const cases = await Case.find(filter)
        .populate('createdBy', 'name email')
        .populate('assignedSpecialist', 'name email')
        .sort({ createdAt: -1 });
    res.json(cases);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getCaseById = async (req, res) => {
  try {
    const caseDoc = await Case.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('assignedSpecialist', 'name email');
    if (!caseDoc) {
      return res.status(404).json({ message: 'Case not found' });
    }
    res.json(caseDoc);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.requestSecondOpinion = async (req, res) => {
  try {
    const caseDoc = await Case.findById(req.params.id);
    if (!caseDoc) return res.status(404).json({ message: 'Case not found' });
    
    caseDoc.status = 'escalated';
    if (req.body.specialistId) {
      caseDoc.assignedSpecialist = req.body.specialistId;
    }
    
    const updatedCase = await caseDoc.save();
    const populatedUpdated = await Case.findById(updatedCase._id).populate('createdBy assignedSpecialist', 'name email');
    
    // Emit socket events
    if (req.io) {
      req.io.emit('case_updated', populatedUpdated);
      if (updatedCase.assignedSpecialist) {
         // Notify the specific specialist
         req.io.to(updatedCase.assignedSpecialist.toString()).emit('new_assignment', populatedUpdated);
      }
    }
    
    res.json(populatedUpdated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.respondToCase = async (req, res) => {
  try {
    const caseDoc = await Case.findById(req.params.id);
    if (!caseDoc) return res.status(404).json({ message: 'Case not found' });
    
    const newResponse = new Response({
      caseId: req.params.id,
      specialistId: req.user._id,
      diagnosis: req.body.diagnosis,
      recommendation: req.body.recommendation,
      notes: req.body.notes
    });
    
    await newResponse.save();
    const populatedResponse = await Response.findById(newResponse._id).populate('specialistId', 'name email');
    
    caseDoc.status = 'resolved';
    const updatedCase = await caseDoc.save();
    const populatedUpdated = await Case.findById(updatedCase._id).populate('createdBy assignedSpecialist', 'name email');
    
    if (req.io) {
      req.io.emit('case_updated', populatedUpdated);
      // Notify the worker who created the case
      req.io.to(caseDoc.createdBy.toString()).emit('case_resolved', { case: populatedUpdated, response: populatedResponse });
    }
    
    res.json({ case: populatedUpdated, response: populatedResponse });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getCaseResponses = async (req, res) => {
  try {
    const responses = await Response.find({ caseId: req.params.id }).populate('specialistId', 'name email').sort({ createdAt: -1 });
    res.json(responses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
