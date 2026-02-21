const mongoose = require('mongoose');

const aiAnalysisSchema = new mongoose.Schema({
  possibleDiseases: [String],
  riskLevel: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Low'
  },
  recommendation: String,
  confidence: Number
}, { _id: false });

const caseSchema = new mongoose.Schema({
  patientName: {
    type: String,
    required: true
  },
  age: {
    type: Number,
    required: true
  },
  gender: {
    type: String,
    required: true
  },
  symptoms: {
    type: String,
    required: true
  },
  temperature: Number,
  bloodPressure: String,
  heartRate: Number,
  history: String,
  status: {
    type: String,
    enum: ['pending', 'under_review', 'escalated', 'resolved'],
    default: 'pending'
  },
  attachments: [{
    filename: String,
    path: String,
    mimetype: String
  }],
  aiAnalysis: aiAnalysisSchema,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedSpecialist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });

module.exports = mongoose.model('Case', caseSchema);
