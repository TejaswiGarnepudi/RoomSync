const express = require('express');
const {
  createHousehold,
  getMyHousehold,
  joinHousehold,
  leaveHousehold,
  removeMember,
  regenerateInviteCode
} = require('../controllers/householdController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.post('/', createHousehold);
router.get('/my', getMyHousehold);
router.post('/join', joinHousehold);
router.post('/leave', leaveHousehold);
router.delete('/members/:userId', removeMember);
router.post('/regenerate-invite', regenerateInviteCode);

module.exports = router;
