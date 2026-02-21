const mongoose = require('mongoose');

const responseSchema = new mongoose.Schema({
  caseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Case',
    required: true
  },
  specialistId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  diagnosis: {
    type: String,
    required: true
  },
  recommendation: {
    type: String,
    required: true
  },
  notes: String
}, { timestamps: true });

module.exports = mongoose.model('Response', responseSchema);
