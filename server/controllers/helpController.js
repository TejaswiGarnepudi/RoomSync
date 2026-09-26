const HelpRequest = require('../models/HelpRequest');
const Household = require('../models/Household');
const { getUserHousehold } = require('../services/availabilityService');
const { getHelpRecommendations } = require('../services/helpRecommendationService');
const { createNotification, createBulkNotifications } = require('../services/notificationService');
const { logActivity } = require('../services/activityService');

// @desc    Create a new help request
// @route   POST /api/help
// @access  Private
exports.createHelpRequest = async (req, res, next) => {
  try {
    const household = await getUserHousehold(req.user._id);
    if (!household) {
      res.status(400);
      throw new Error('You must belong to a household to request help');
    }

    const {
      title,
      description = '',
      type = 'errand',
      date,
      startTime,
      endTime,
      location = '',
      fromLocation = '',
      toLocation = '',
      urgency = 'medium'
    } = req.body;

    if (!title || !date || !startTime || !endTime) {
      res.status(400);
      throw new Error('Please provide title, date, startTime, and endTime');
    }

    if (startTime >= endTime) {
      res.status(400);
      throw new Error('End time must be after start time');
    }

    const helpRequest = await HelpRequest.create({
      householdId: household._id,
      requester: req.user._id,
      title: title.trim(),
      description: description.trim(),
      type,
      date,
      startTime,
      endTime,
      location: location.trim(),
      fromLocation: fromLocation.trim(),
      toLocation: toLocation.trim(),
      urgency,
      status: 'open'
    });

    const populated = await HelpRequest.findById(helpRequest._id)
      .populate('requester acceptedBy', 'name email profilePhoto');

    const io = req.app.get('io');
    const otherMembers = household.members.filter(m => m.toString() !== req.user._id.toString());
    await createBulkNotifications({
      userIds: otherMembers,
      householdId: household._id,
      type: 'help_request',
      title: 'New Help Request',
      message: `${req.user.name} asked for assistance: "${helpRequest.title}".`,
      entityType: 'help',
      entityId: helpRequest._id,
      io
    });

    await logActivity({
      householdId: household._id,
      actor: req.user._id,
      type: 'help_requested',
      message: `${req.user.name} requested help: "${helpRequest.title}".`,
      entityType: 'help',
      entityId: helpRequest._id,
      io
    });

    res.status(201).json({
      success: true,
      message: 'Help request created successfully',
      data: { helpRequest: populated, request: populated }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get household help requests with filters
// @route   GET /api/help
// @access  Private
exports.getHelpRequests = async (req, res, next) => {
  try {
    const household = await getUserHousehold(req.user._id);
    if (!household) {
      res.status(400);
      throw new Error('You must belong to a household');
    }

    const { status, type, urgency, date, requester, acceptedBy } = req.query;
    const filter = { householdId: household._id };

    if (status && status !== 'all') filter.status = status;
    if (type && type !== 'all') filter.type = type;
    if (urgency && urgency !== 'all') filter.urgency = urgency;
    if (date) filter.date = date;
    if (requester) filter.requester = requester === 'me' ? req.user._id : requester;
    if (acceptedBy) filter.acceptedBy = acceptedBy === 'me' ? req.user._id : acceptedBy;

    const requests = await HelpRequest.find(filter)
      .populate('requester acceptedBy', 'name email profilePhoto')
      .sort({ date: 1, startTime: 1, createdAt: -1 });

    res.status(200).json({
      success: true,
      data: { helpRequests: requests, requests }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get help history (My Requests vs Help I Provided)
// @route   GET /api/help/history
// @access  Private
exports.getHelpHistory = async (req, res, next) => {
  try {
    const household = await getUserHousehold(req.user._id);
    if (!household) {
      res.status(400);
      throw new Error('You must belong to a household');
    }

    const myRequests = await HelpRequest.find({
      householdId: household._id,
      requester: req.user._id
    })
    .populate('requester acceptedBy', 'name email profilePhoto')
    .sort({ createdAt: -1 });

    const helpProvided = await HelpRequest.find({
      householdId: household._id,
      acceptedBy: req.user._id
    })
    .populate('requester acceptedBy', 'name email profilePhoto')
    .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        myRequests,
        helpProvided,
        history: [...myRequests, ...helpProvided],
        totalRequested: myRequests.length,
        totalProvided: helpProvided.length,
        completedProvided: helpProvided.filter(h => h.status === 'completed').length
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single help request by ID
// @route   GET /api/help/:id
// @access  Private
exports.getHelpRequestById = async (req, res, next) => {
  try {
    const household = await getUserHousehold(req.user._id);
    if (!household) {
      res.status(400);
      throw new Error('You must belong to a household');
    }

    const helpRequest = await HelpRequest.findById(req.params.id)
      .populate('requester acceptedBy', 'name email profilePhoto');

    if (!helpRequest) {
      res.status(404);
      throw new Error('Help request not found');
    }

    if (helpRequest.householdId.toString() !== household._id.toString()) {
      res.status(403);
      throw new Error('Unauthorized to access this help request');
    }

    res.status(200).json({
      success: true,
      data: { helpRequest, request: helpRequest }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update help request (only open requests by requester)
// @route   PUT /api/help/:id
// @access  Private
exports.updateHelpRequest = async (req, res, next) => {
  try {
    const household = await getUserHousehold(req.user._id);
    if (!household) {
      res.status(400);
      throw new Error('You must belong to a household');
    }

    const helpRequest = await HelpRequest.findById(req.params.id);
    if (!helpRequest) {
      res.status(404);
      throw new Error('Help request not found');
    }

    if (helpRequest.householdId.toString() !== household._id.toString()) {
      res.status(403);
      throw new Error('Unauthorized');
    }

    if (helpRequest.requester.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Only the requester can modify this request');
    }

    if (helpRequest.status !== 'open') {
      res.status(400);
      throw new Error(`Cannot edit request in "${helpRequest.status}" status`);
    }

    const {
      title,
      description,
      type,
      date,
      startTime,
      endTime,
      location,
      fromLocation,
      toLocation,
      urgency
    } = req.body;

    if (title !== undefined) helpRequest.title = title.trim();
    if (description !== undefined) helpRequest.description = description.trim();
    if (type !== undefined) helpRequest.type = type;
    if (date !== undefined) helpRequest.date = date;
    if (startTime !== undefined) helpRequest.startTime = startTime;
    if (endTime !== undefined) helpRequest.endTime = endTime;
    if (location !== undefined) helpRequest.location = location.trim();
    if (fromLocation !== undefined) helpRequest.fromLocation = fromLocation.trim();
    if (toLocation !== undefined) helpRequest.toLocation = toLocation.trim();
    if (urgency !== undefined) helpRequest.urgency = urgency;

    if (helpRequest.startTime >= helpRequest.endTime) {
      res.status(400);
      throw new Error('End time must be after start time');
    }

    await helpRequest.save();

    const populated = await HelpRequest.findById(helpRequest._id)
      .populate('requester acceptedBy', 'name email profilePhoto');

    res.status(200).json({
      success: true,
      message: 'Help request updated successfully',
      data: { helpRequest: populated }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete or cancel help request
// @route   DELETE /api/help/:id
// @access  Private
exports.deleteHelpRequest = async (req, res, next) => {
  try {
    const household = await getUserHousehold(req.user._id);
    if (!household) {
      res.status(400);
      throw new Error('You must belong to a household');
    }

    const helpRequest = await HelpRequest.findById(req.params.id);
    if (!helpRequest) {
      res.status(404);
      throw new Error('Help request not found');
    }

    if (helpRequest.householdId.toString() !== household._id.toString()) {
      res.status(403);
      throw new Error('Unauthorized');
    }

    if (helpRequest.requester.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Only the requester can delete/cancel this request');
    }

    // If open, delete permanently; if accepted/in_progress, mark cancelled
    if (helpRequest.status === 'open') {
      await HelpRequest.deleteOne({ _id: helpRequest._id });
      res.status(200).json({
        success: true,
        message: 'Help request deleted successfully'
      });
    } else {
      helpRequest.status = 'cancelled';
      await helpRequest.save();
      res.status(200).json({
        success: true,
        message: 'Help request cancelled'
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Accept an open help request
// @route   POST /api/help/:id/accept
// @access  Private
exports.acceptHelpRequest = async (req, res, next) => {
  try {
    const household = await getUserHousehold(req.user._id);
    if (!household) {
      res.status(400);
      throw new Error('You must belong to a household');
    }

    const helpRequest = await HelpRequest.findById(req.params.id);
    if (!helpRequest) {
      res.status(404);
      throw new Error('Help request not found');
    }

    if (helpRequest.householdId.toString() !== household._id.toString()) {
      res.status(403);
      throw new Error('Unauthorized');
    }

    if (helpRequest.requester.toString() === req.user._id.toString()) {
      res.status(400);
      throw new Error('You cannot accept your own help request');
    }

    if (helpRequest.status !== 'open') {
      res.status(400);
      throw new Error(`This request is no longer open (currently "${helpRequest.status}")`);
    }

    helpRequest.status = 'accepted';
    helpRequest.acceptedBy = req.user._id;
    helpRequest.acceptedAt = new Date();

    await helpRequest.save();

    const populated = await HelpRequest.findById(helpRequest._id)
      .populate('requester acceptedBy', 'name email profilePhoto');

    const io = req.app.get('io');
    if (helpRequest.requester && helpRequest.requester.toString() !== req.user._id.toString()) {
      await createNotification({
        userId: helpRequest.requester,
        householdId: household._id,
        type: 'help_accepted',
        title: 'Help Request Accepted',
        message: `${req.user.name} accepted your request: "${helpRequest.title}".`,
        entityType: 'help',
        entityId: helpRequest._id,
        io
      });
    }

    await logActivity({
      householdId: household._id,
      actor: req.user._id,
      type: 'help_accepted',
      message: `${req.user.name} accepted "${helpRequest.title}".`,
      entityType: 'help',
      entityId: helpRequest._id,
      io
    });

    res.status(200).json({
      success: true,
      message: `You accepted ${populated.requester.name}'s help request`,
      data: { helpRequest: populated, request: populated }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Start accepted help request
// @route   POST /api/help/:id/start
// @access  Private
exports.startHelpRequest = async (req, res, next) => {
  try {
    const household = await getUserHousehold(req.user._id);
    if (!household) {
      res.status(400);
      throw new Error('You must belong to a household');
    }

    const helpRequest = await HelpRequest.findById(req.params.id);
    if (!helpRequest) {
      res.status(404);
      throw new Error('Help request not found');
    }

    if (helpRequest.householdId.toString() !== household._id.toString()) {
      res.status(403);
      throw new Error('Unauthorized');
    }

    const isHelper = helpRequest.acceptedBy && helpRequest.acceptedBy.toString() === req.user._id.toString();
    const isRequester = helpRequest.requester.toString() === req.user._id.toString();

    if (!isHelper && !isRequester) {
      res.status(403);
      throw new Error('Only the helper or requester can start this request');
    }

    if (helpRequest.status !== 'accepted') {
      res.status(400);
      throw new Error(`Cannot start request in "${helpRequest.status}" status`);
    }

    helpRequest.status = 'in_progress';
    await helpRequest.save();

    const populated = await HelpRequest.findById(helpRequest._id)
      .populate('requester acceptedBy', 'name email profilePhoto');

    res.status(200).json({
      success: true,
      message: 'Help request marked in progress',
      data: { helpRequest: populated, request: populated }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Complete help request
// @route   POST /api/help/:id/complete
// @access  Private
exports.completeHelpRequest = async (req, res, next) => {
  try {
    const household = await getUserHousehold(req.user._id);
    if (!household) {
      res.status(400);
      throw new Error('You must belong to a household');
    }

    const helpRequest = await HelpRequest.findById(req.params.id);
    if (!helpRequest) {
      res.status(404);
      throw new Error('Help request not found');
    }

    if (helpRequest.householdId.toString() !== household._id.toString()) {
      res.status(403);
      throw new Error('Unauthorized');
    }

    const isHelper = helpRequest.acceptedBy && helpRequest.acceptedBy.toString() === req.user._id.toString();
    const isRequester = helpRequest.requester.toString() === req.user._id.toString();

    if (!isHelper && !isRequester) {
      res.status(403);
      throw new Error('Only the helper or requester can complete this request');
    }

    if (helpRequest.status === 'completed') {
      res.status(400);
      throw new Error('This request is already completed');
    }

    helpRequest.status = 'completed';
    helpRequest.completedAt = new Date();
    await helpRequest.save();

    const populated = await HelpRequest.findById(helpRequest._id)
      .populate('requester acceptedBy', 'name email profilePhoto');

    const io = req.app.get('io');
    const notifyTarget = isHelper ? helpRequest.requester : helpRequest.acceptedBy;
    if (notifyTarget && notifyTarget.toString() !== req.user._id.toString()) {
      await createNotification({
        userId: notifyTarget,
        householdId: household._id,
        type: 'help_completed',
        title: 'Help Task Completed',
        message: `${req.user.name} marked "${helpRequest.title}" as completed.`,
        entityType: 'help',
        entityId: helpRequest._id,
        io
      });
    }

    await logActivity({
      householdId: household._id,
      actor: req.user._id,
      type: 'help_completed',
      message: `${req.user.name} completed "${helpRequest.title}".`,
      entityType: 'help',
      entityId: helpRequest._id,
      io
    });

    res.status(200).json({
      success: true,
      message: 'Help request completed! Great teamwork 🎉',
      data: { helpRequest: populated, request: populated }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel help request
// @route   POST /api/help/:id/cancel
// @access  Private
exports.cancelHelpRequest = async (req, res, next) => {
  try {
    const household = await getUserHousehold(req.user._id);
    if (!household) {
      res.status(400);
      throw new Error('You must belong to a household');
    }

    const helpRequest = await HelpRequest.findById(req.params.id);
    if (!helpRequest) {
      res.status(404);
      throw new Error('Help request not found');
    }

    if (helpRequest.householdId.toString() !== household._id.toString()) {
      res.status(403);
      throw new Error('Unauthorized');
    }

    if (helpRequest.requester.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Only the requester can cancel this request');
    }

    helpRequest.status = 'cancelled';
    await helpRequest.save();

    const populated = await HelpRequest.findById(helpRequest._id)
      .populate('requester acceptedBy', 'name email profilePhoto');

    res.status(200).json({
      success: true,
      message: 'Help request cancelled',
      data: { helpRequest: populated, request: populated }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get availability recommendations for a help request
// @route   GET /api/help/:id/recommendations
// @access  Private
exports.getHelpRecommendations = async (req, res, next) => {
  try {
    const household = await getUserHousehold(req.user._id);
    if (!household) {
      res.status(400);
      throw new Error('You must belong to a household');
    }

    const helpRequest = await HelpRequest.findById(req.params.id);
    if (!helpRequest) {
      res.status(404);
      throw new Error('Help request not found');
    }

    if (helpRequest.householdId.toString() !== household._id.toString()) {
      res.status(403);
      throw new Error('Unauthorized');
    }

    const recommendations = await getHelpRecommendations(helpRequest);

    res.status(200).json({
      success: true,
      data: { recommendations }
    });
  } catch (error) {
    next(error);
  }
};
