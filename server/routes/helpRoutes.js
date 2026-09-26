const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  createHelpRequest,
  getHelpRequests,
  getHelpHistory,
  getHelpRequestById,
  updateHelpRequest,
  deleteHelpRequest,
  acceptHelpRequest,
  startHelpRequest,
  completeHelpRequest,
  cancelHelpRequest,
  getHelpRecommendations
} = require('../controllers/helpController');

router.use(protect);

router.route('/')
  .post(createHelpRequest)
  .get(getHelpRequests);

router.get('/history', getHelpHistory);

router.route('/:id')
  .get(getHelpRequestById)
  .put(updateHelpRequest)
  .delete(deleteHelpRequest);

router.post('/:id/accept', acceptHelpRequest);
router.post('/:id/start', startHelpRequest);
router.post('/:id/complete', completeHelpRequest);
router.post('/:id/cancel', cancelHelpRequest);
router.get('/:id/recommendations', getHelpRecommendations);

module.exports = router;
