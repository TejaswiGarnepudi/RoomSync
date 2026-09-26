const Poll = require('../models/Poll');
const PollVote = require('../models/PollVote');
const Household = require('../models/Household');
const { getUserHousehold } = require('../services/availabilityService');
const { calculatePollResults, castVote } = require('../services/pollVoteService');
const { createBulkNotifications } = require('../services/notificationService');
const { logActivity } = require('../services/activityService');

// @desc    Create a new household poll / decision
// @route   POST /api/polls
// @access  Private
exports.createPoll = async (req, res, next) => {
  try {
    const household = await getUserHousehold(req.user._id);
    if (!household) {
      res.status(400);
      throw new Error('You must belong to a household to create polls');
    }

    const {
      title,
      description = '',
      options = [],
      allowMultiple = false,
      anonymous = false,
      deadline
    } = req.body;

    if (!title || !title.trim()) {
      res.status(400);
      throw new Error('Poll title/question is required');
    }

    if (!Array.isArray(options) || options.length < 2) {
      res.status(400);
      throw new Error('A poll must have at least 2 options');
    }

    // Validate options have non-empty text and are unique
    const formattedOptions = [];
    const seenTexts = new Set();

    for (let i = 0; i < options.length; i++) {
      const optText = (typeof options[i] === 'string' ? options[i] : options[i].text || '').trim();
      if (!optText) {
        res.status(400);
        throw new Error(`Option ${i + 1} cannot be empty`);
      }
      if (seenTexts.has(optText.toLowerCase())) {
        res.status(400);
        throw new Error(`Duplicate option text: "${optText}"`);
      }
      seenTexts.add(optText.toLowerCase());

      const optId = options[i].optionId || `opt_${i + 1}_${Date.now()}`;
      formattedOptions.push({
        optionId: optId,
        text: optText
      });
    }

    let deadlineDate = null;
    if (deadline) {
      deadlineDate = new Date(deadline);
      if (isNaN(deadlineDate.getTime()) || deadlineDate <= new Date()) {
        res.status(400);
        throw new Error('Deadline must be a valid future date and time');
      }
    }

    const poll = await Poll.create({
      householdId: household._id,
      title: title.trim(),
      description: description.trim(),
      options: formattedOptions,
      createdBy: req.user._id,
      allowMultiple: Boolean(allowMultiple),
      anonymous: Boolean(anonymous),
      deadline: deadlineDate,
      status: 'active'
    });

    const populated = await Poll.findById(poll._id)
      .populate('createdBy', 'name email profilePhoto');

    const results = await calculatePollResults(populated, req.user._id);

    // Emit Socket.io event for real-time update to household room
    const io = req.app.get('io');
    if (io) {
      io.to(`household:${household._id}`).emit('poll:created', {
        poll: results.poll
      });
    }

    const otherMembers = household.members.filter(m => m.toString() !== req.user._id.toString());
    await createBulkNotifications({
      userIds: otherMembers,
      householdId: household._id,
      type: 'poll_created',
      title: 'New Household Decision',
      message: `${req.user.name} created a new poll: "${poll.title}".`,
      entityType: 'poll',
      entityId: poll._id,
      io
    });

    await logActivity({
      householdId: household._id,
      actor: req.user._id,
      type: 'poll_created',
      message: `${req.user.name} created a decision poll: "${poll.title}".`,
      entityType: 'poll',
      entityId: poll._id,
      io
    });

    res.status(201).json({
      success: true,
      message: 'Decision poll created successfully',
      data: results
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get household polls with status filter
// @route   GET /api/polls
// @access  Private
exports.getPolls = async (req, res, next) => {
  try {
    const household = await getUserHousehold(req.user._id);
    if (!household) {
      res.status(400);
      throw new Error('You must belong to a household');
    }

    // Auto-expire active polls past deadline
    const now = new Date();
    await Poll.updateMany(
      { householdId: household._id, status: 'active', deadline: { $lte: now } },
      { status: 'expired' }
    );

    const { status } = req.query;
    const filter = { householdId: household._id };

    if (status && status !== 'all') {
      filter.status = status;
    }

    const polls = await Poll.find(filter)
      .populate('createdBy', 'name email profilePhoto')
      .sort({ createdAt: -1 });

    // Calculate lightweight summary for each poll
    const pollResults = await Promise.all(
      polls.map(p => calculatePollResults(p, req.user._id))
    );

    res.status(200).json({
      success: true,
      data: { polls: pollResults }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get poll details with results
// @route   GET /api/polls/:id
// @access  Private
exports.getPollById = async (req, res, next) => {
  try {
    const household = await getUserHousehold(req.user._id);
    if (!household) {
      res.status(400);
      throw new Error('You must belong to a household');
    }

    const poll = await Poll.findById(req.params.id)
      .populate('createdBy', 'name email profilePhoto');

    if (!poll) {
      res.status(404);
      throw new Error('Poll not found');
    }

    if (poll.householdId.toString() !== household._id.toString()) {
      res.status(403);
      throw new Error('Unauthorized');
    }

    const results = await calculatePollResults(poll, req.user._id);

    res.status(200).json({
      success: true,
      data: results
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cast or change vote on a poll
// @route   POST /api/polls/:id/vote
// @access  Private
exports.votePoll = async (req, res, next) => {
  try {
    const household = await getUserHousehold(req.user._id);
    if (!household) {
      res.status(400);
      throw new Error('You must belong to a household');
    }

    const { optionIds } = req.body;
    const io = req.app.get('io');

    const results = await castVote({
      pollId: req.params.id,
      householdId: household._id,
      userId: req.user._id,
      optionIds,
      io
    });

    res.status(200).json({
      success: true,
      message: 'Vote recorded successfully',
      data: results
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Close poll
// @route   POST /api/polls/:id/close
// @access  Private
exports.closePoll = async (req, res, next) => {
  try {
    const household = await getUserHousehold(req.user._id);
    if (!household) {
      res.status(400);
      throw new Error('You must belong to a household');
    }

    const poll = await Poll.findById(req.params.id)
      .populate('createdBy', 'name email profilePhoto');

    if (!poll) {
      res.status(404);
      throw new Error('Poll not found');
    }

    if (poll.householdId.toString() !== household._id.toString()) {
      res.status(403);
      throw new Error('Unauthorized');
    }

    const isCreator = poll.createdBy?._id.toString() === req.user._id.toString();
    const isOwner = household.owner.toString() === req.user._id.toString();

    if (!isCreator && !isOwner) {
      res.status(403);
      throw new Error('Only the poll creator or household owner can close this poll');
    }

    poll.status = 'closed';
    await poll.save();

    const results = await calculatePollResults(poll, req.user._id);

    const io = req.app.get('io');
    if (io) {
      const publicResults = await calculatePollResults(poll, null);
      io.to(`household:${household._id}`).emit('poll:updated', {
        pollId: poll._id.toString(),
        results: publicResults
      });
    }

    res.status(200).json({
      success: true,
      message: 'Poll closed successfully',
      data: results
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete poll
// @route   DELETE /api/polls/:id
// @access  Private
exports.deletePoll = async (req, res, next) => {
  try {
    const household = await getUserHousehold(req.user._id);
    if (!household) {
      res.status(400);
      throw new Error('You must belong to a household');
    }

    const poll = await Poll.findById(req.params.id);
    if (!poll) {
      res.status(404);
      throw new Error('Poll not found');
    }

    if (poll.householdId.toString() !== household._id.toString()) {
      res.status(403);
      throw new Error('Unauthorized');
    }

    const isCreator = poll.createdBy.toString() === req.user._id.toString();
    const isOwner = household.owner.toString() === req.user._id.toString();

    if (!isCreator && !isOwner) {
      res.status(403);
      throw new Error('Only the creator or household owner can delete this poll');
    }

    await Poll.deleteOne({ _id: poll._id });
    await PollVote.deleteMany({ pollId: poll._id });

    const io = req.app.get('io');
    if (io) {
      io.to(`household:${household._id}`).emit('poll:deleted', {
        pollId: poll._id.toString()
      });
    }

    res.status(200).json({
      success: true,
      message: 'Poll deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
