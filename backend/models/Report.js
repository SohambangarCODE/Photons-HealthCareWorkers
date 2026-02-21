const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  fileUrl: {
    type: String,
    required: true
  },
  caseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Case',
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Report', reportSchema);
