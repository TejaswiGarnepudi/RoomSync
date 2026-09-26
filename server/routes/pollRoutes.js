const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  createPoll,
  getPolls,
  getPollById,
  votePoll,
  closePoll,
  deletePoll
} = require('../controllers/pollController');

router.use(protect);

router.route('/')
  .post(createPoll)
  .get(getPolls);

router.route('/:id')
  .get(getPollById)
  .delete(deletePoll);

router.post('/:id/vote', votePoll);
router.post('/:id/close', closePoll);

module.exports = router;
