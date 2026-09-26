const mongoose = require('mongoose');

const pollVoteSchema = new mongoose.Schema({
  pollId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Poll',
    required: true,
    index: true
  },
  householdId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Household',
    required: true,
    index: true
  },
  optionId: {
    type: String,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  }
}, {
  timestamps: true
});

// Prevent duplicate votes for the same option by the same user in a poll
pollVoteSchema.index({ pollId: 1, userId: 1, optionId: 1 }, { unique: true });
pollVoteSchema.index({ pollId: 1, userId: 1 });

module.exports = mongoose.model('PollVote', pollVoteSchema);
