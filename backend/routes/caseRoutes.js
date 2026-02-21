const express = require('express');
const router = express.Router();
const { 
  createCase, 
  getCases, 
  getCaseById, 
  requestSecondOpinion, 
  respondToCase,
  getCaseResponses
} = require('../controllers/caseController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.route('/')
  .post(protect, authorize('worker'), upload.array('files', 5), createCase)
  .get(protect, getCases);

router.route('/:id')
  .get(protect, getCaseById);

router.post('/:id/request-second-opinion', protect, authorize('worker'), requestSecondOpinion);
router.post('/:id/respond', protect, authorize('specialist', 'admin'), respondToCase);
router.get('/:id/responses', protect, getCaseResponses);

module.exports = router;
