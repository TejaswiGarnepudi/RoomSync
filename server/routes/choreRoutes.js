const express = require('express');
const {
  createChore,
  getChores,
  getChoreById,
  updateChore,
  deleteChore,
  claimChore,
  assignChore,
  completeChore,
  getSmartRecommendation,
  assignSmartRecommendation,
  getChoreHistory,
  getHouseholdWorkload
} = require('../controllers/choreController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.post('/', createChore);
router.get('/', getChores);
router.get('/history', getChoreHistory);
router.get('/workload', getHouseholdWorkload);
router.get('/:id', getChoreById);
router.put('/:id', updateChore);
router.delete('/:id', deleteChore);

router.post('/:id/claim', claimChore);
router.post('/:id/assign', assignChore);
router.post('/:id/complete', completeChore);
router.get('/:id/recommendation', getSmartRecommendation);
router.post('/:id/assign-smart', assignSmartRecommendation);

module.exports = router;
