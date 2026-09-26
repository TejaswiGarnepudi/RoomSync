const Poll = require('../models/Poll');
const PollVote = require('../models/PollVote');

/**
 * Calculate full results and statistics for a poll
 */
const calculatePollResults = async (poll, requestingUserId = null) => {
  // Check deadline
  const now = new Date();
  if (poll.status === 'active' && poll.deadline && new Date(poll.deadline) <= now) {
    poll.status = 'expired';
    await poll.save();
  }

  const votes = await PollVote.find({ pollId: poll._id }).populate('userId', 'name email profilePhoto');
  const totalVotesCount = votes.length;

  // Set of unique voters
  const uniqueVoterIds = new Set(votes.map(v => v.userId?._id ? v.userId._id.toString() : v.userId.toString()));
  const totalParticipants = uniqueVoterIds.size;

  const myVoteOptionIds = [];
  if (requestingUserId) {
    votes.forEach(v => {
      const vUserId = v.userId?._id ? v.userId._id.toString() : v.userId.toString();
      if (vUserId === requestingUserId.toString()) {
        myVoteOptionIds.push(v.optionId);
      }
    });
  }

  const optionsWithResults = poll.options.map(opt => {
    const optVotes = votes.filter(v => v.optionId === opt.optionId);
    const voteCount = optVotes.length;
    const percentage = totalVotesCount > 0 ? Math.round((voteCount / totalVotesCount) * 100) : 0;

    const votersList = poll.anonymous
      ? []
      : optVotes.map(v => ({
          _id: v.userId?._id,
          name: v.userId?.name,
          profilePhoto: v.userId?.profilePhoto
        }));

    return {
      optionId: opt.optionId,
      text: opt.text,
      voteCount,
      percentage,
      voters: votersList,
      hasVoted: myVoteOptionIds.includes(opt.optionId)
    };
  });

  const formattedPoll = {
    _id: poll._id,
    householdId: poll.householdId,
    title: poll.title,
    description: poll.description,
    createdBy: poll.createdBy,
    allowMultiple: poll.allowMultiple,
    anonymous: poll.anonymous,
    deadline: poll.deadline,
    status: poll.status,
    options: optionsWithResults,
    totalVotes: totalVotesCount,
    totalParticipants,
    userVoteOptionIds: myVoteOptionIds,
    myVotes: myVoteOptionIds,
    hasVoted: myVoteOptionIds.length > 0,
    hasParticipated: myVoteOptionIds.length > 0,
    isExpired: poll.status === 'expired' || (poll.deadline && new Date(poll.deadline) <= now),
    createdAt: poll.createdAt,
    updatedAt: poll.updatedAt
  };

  return {
    poll: formattedPoll,
    ...formattedPoll
  };
};

/**
 * Cast or change vote on a poll
 */
const castVote = async ({ pollId, householdId, userId, optionIds, io = null }) => {
  const poll = await Poll.findById(pollId);
  if (!poll) {
    const err = new Error('Poll not found');
    err.status = 404;
    throw err;
  }

  if (poll.householdId.toString() !== householdId.toString()) {
    const err = new Error('Unauthorized');
    err.status = 403;
    throw err;
  }

  // Check deadline & status
  const now = new Date();
  if (poll.status !== 'active' || (poll.deadline && new Date(poll.deadline) <= now)) {
    if (poll.status === 'active') {
      poll.status = 'expired';
      await poll.save();
    }
    const err = new Error('Voting is closed for this decision');
    err.status = 400;
    throw err;
  }

  if (!Array.isArray(optionIds) || optionIds.length === 0) {
    const err = new Error('Please select at least one option');
    err.status = 400;
    throw err;
  }

  if (!poll.allowMultiple && optionIds.length > 1) {
    const err = new Error('Single-choice polls allow only one option');
    err.status = 400;
    throw err;
  }

  // Validate that all optionIds exist on this poll
  const validOptionIds = poll.options.map(o => o.optionId);
  for (const optId of optionIds) {
    if (!validOptionIds.includes(optId)) {
      const err = new Error(`Invalid option ID: ${optId}`);
      err.status = 400;
      throw err;
    }
  }

  // Remove previous votes by this user on this poll
  await PollVote.deleteMany({ pollId: poll._id, userId });

  // Insert new votes
  const newVotes = optionIds.map(optId => ({
    pollId: poll._id,
    householdId: poll.householdId,
    optionId: optId,
    userId
  }));

  await PollVote.insertMany(newVotes);

  // Compute updated results
  const results = await calculatePollResults(poll, userId);

  // Emit real-time socket event if io is provided
  if (io) {
    // Non-personalized broadcast (without specific myVotes)
    const publicResults = await calculatePollResults(poll, null);
    io.to(`household:${householdId}`).emit('poll:updated', {
      pollId: poll._id.toString(),
      results: publicResults
    });
  }

  return results;
};

module.exports = {
  calculatePollResults,
  castVote
};
