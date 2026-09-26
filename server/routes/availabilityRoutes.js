const express = require('express');
const {
  createAvailability,
  getMyAvailability,
  getHouseholdAvailability,
  getCommonAvailability,
  updateAvailability,
  deleteAvailability
} = require('../controllers/availabilityController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.post('/', createAvailability);
router.get('/my', getMyAvailability);
router.get('/household', getHouseholdAvailability);
router.get('/household/common', getCommonAvailability);
router.put('/:id', updateAvailability);
router.delete('/:id', deleteAvailability);

module.exports = router;
