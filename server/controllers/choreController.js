const Chore = require('../models/Chore');
const ChoreHistory = require('../models/ChoreHistory');
const Household = require('../models/Household');
const { getUserHousehold } = require('../services/availabilityService');
const { calculateHouseholdWorkloads } = require('../services/choreWorkloadService');
const { createNextOccurrence } = require('../services/choreRecurrenceService');
const { recommendChoreAssignee } = require('../services/choreAssignmentService');
const { createNotification } = require('../services/notificationService');
const { logActivity } = require('../services/activityService');

// Helper: Format YYYY-MM-DD
const formatDateStr = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

// Helper: Format current time as HH:MM
const formatTimeStr = (d) => {
  const h = String(d.getHours()).padStart(2, '0');
  const m = String(d.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
};

// Internal Helper: Automatically check and update overdue chores in a household
const updateOverdueChores = async (householdId) => {
  const now = new Date();
  const todayStr = formatDateStr(now);
  const nowTimeStr = formatTimeStr(now);

  const overdueCandidates = await Chore.find({
    householdId,
    status: { $in: ['pending', 'assigned', 'in_progress'] },
    $or: [
      { dueDate: { $lt: todayStr } },
      { dueDate: todayStr, dueTime: { $lt: nowTimeStr } }
    ]
  });

  for (const chore of overdueCandidates) {
    chore.status = 'overdue';
    await chore.save();

    await ChoreHistory.create({
      choreId: chore._id,
      householdId: chore.householdId,
      userId: chore.createdBy,
      action: 'marked_overdue',
      notes: `Chore passed deadline of ${chore.dueDate} ${chore.dueTime}`
    });
  }
};

// @desc    Create a new chore
// @route   POST /api/chores
// @access  Private
exports.createChore = async (req, res, next) => {
  try {
    const household = await getUserHousehold(req.user._id);
    if (!household) {
      res.status(400);
      throw new Error('You must belong to a household to create chores');
    }

    const {
      title,
      description = '',
      category = 'general',
      estimatedDuration,
      priority = 'medium',
      dueDate,
      dueTime = '23:59',
      startTime = null,
      assignmentType = 'unassigned',
      assignedTo = null,
      recurrence = { type: 'none', interval: 1 },
      recurrenceEndDate = null
    } = req.body;

    if (!title || !dueDate || !estimatedDuration) {
      res.status(400);
      throw new Error('Please provide title, estimatedDuration, and dueDate');
    }

    if (Number(estimatedDuration) <= 0) {
      res.status(400);
      throw new Error('Estimated duration must be greater than 0');
    }

    let finalAssignedTo = null;
    let finalStatus = 'pending';
    let finalAssignmentType = assignmentType;

    if (assignmentType === 'manual' && assignedTo) {
      // Validate assignedTo is a household member
      const isMember = household.members.some(m => m.toString() === assignedTo.toString());
      if (!isMember) {
        res.status(400);
        throw new Error('Assigned user must be a member of the household');
      }
      finalAssignedTo = assignedTo;
      finalStatus = 'assigned';
    } else if (assignmentType === 'smart') {
      finalAssignmentType = 'smart';
      finalStatus = 'pending';
    } else {
      finalAssignmentType = 'unassigned';
      finalStatus = 'pending';
    }

    const chore = await Chore.create({
      householdId: household._id,
      title,
      description,
      category,
      estimatedDuration: Number(estimatedDuration),
      priority,
      dueDate,
      dueTime,
      startTime,
      status: finalStatus,
      assignmentType: finalAssignmentType,
      assignedTo: finalAssignedTo,
      createdBy: req.user._id,
      recurrence,
      recurrenceEndDate
    });

    // Record history
    await ChoreHistory.create({
      choreId: chore._id,
      householdId: household._id,
      userId: req.user._id,
      action: 'created',
      newAssignee: finalAssignedTo,
      notes: `Chore "${title}" created (${finalAssignmentType})`
    });

    const populated = await Chore.findById(chore._id)
      .populate('assignedTo createdBy completedBy', 'name email profilePhoto');

    res.status(201).json({
      success: true,
      message: 'Chore created successfully',
      data: { chore: populated }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get chores for household
// @route   GET /api/chores
// @access  Private
exports.getChores = async (req, res, next) => {
  try {
    const household = await getUserHousehold(req.user._id);
    if (!household) {
      res.status(400);
      throw new Error('You must belong to a household to view chores');
    }

    // Automatically check and update overdue chores
    await updateOverdueChores(household._id);

    const {
      status,
      assignedTo,
      category,
      priority,
      date,
      upcoming,
      search
    } = req.query;

    const filter = { householdId: household._id };

    if (status) {
      if (status.includes(',')) {
        filter.status = { $in: status.split(',') };
      } else {
        filter.status = status;
      }
    }

    if (assignedTo) {
      if (assignedTo === 'me') {
        filter.assignedTo = req.user._id;
      } else if (assignedTo === 'unassigned') {
        filter.assignedTo = null;
      } else {
        filter.assignedTo = assignedTo;
      }
    }

    if (category) filter.category = category;
    if (priority) filter.priority = priority;
    if (date) filter.dueDate = date;

    if (upcoming === 'true') {
      const todayStr = formatDateStr(new Date());
      filter.dueDate = { $gte: todayStr };
      if (!filter.status) {
        filter.status = { $in: ['pending', 'assigned', 'in_progress', 'overdue'] };
      }
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const chores = await Chore.find(filter)
      .populate('assignedTo createdBy completedBy', 'name email profilePhoto')
      .sort({ dueDate: 1, dueTime: 1, priority: -1 });

    res.status(200).json({
      success: true,
      data: { chores }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get chore details by ID
// @route   GET /api/chores/:id
// @access  Private
exports.getChoreById = async (req, res, next) => {
  try {
    const household = await getUserHousehold(req.user._id);
    if (!household) {
      res.status(400);
      throw new Error('You must belong to a household');
    }

    const chore = await Chore.findById(req.params.id)
      .populate('assignedTo createdBy completedBy', 'name email profilePhoto');

    if (!chore) {
      res.status(404);
      throw new Error('Chore not found');
    }

    if (chore.householdId.toString() !== household._id.toString()) {
      res.status(403);
      throw new Error('Unauthorized to view this chore');
    }

    const history = await ChoreHistory.find({ choreId: chore._id })
      .populate('userId previousAssignee newAssignee', 'name email profilePhoto')
      .sort({ timestamp: -1 });

    res.status(200).json({
      success: true,
      data: { chore, history }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update chore details
// @route   PUT /api/chores/:id
// @access  Private
exports.updateChore = async (req, res, next) => {
  try {
    const household = await getUserHousehold(req.user._id);
    if (!household) {
      res.status(400);
      throw new Error('You must belong to a household');
    }

    const chore = await Chore.findById(req.params.id);
    if (!chore) {
      res.status(404);
      throw new Error('Chore not found');
    }

    if (chore.householdId.toString() !== household._id.toString()) {
      res.status(403);
      throw new Error('Unauthorized to modify this chore');
    }

    const {
      title,
      description,
      category,
      estimatedDuration,
      priority,
      dueDate,
      dueTime,
      startTime,
      recurrence,
      recurrenceEndDate
    } = req.body;

    if (title !== undefined) chore.title = title;
    if (description !== undefined) chore.description = description;
    if (category !== undefined) chore.category = category;
    if (estimatedDuration !== undefined) chore.estimatedDuration = Number(estimatedDuration);
    if (priority !== undefined) chore.priority = priority;
    if (dueDate !== undefined) chore.dueDate = dueDate;
    if (dueTime !== undefined) chore.dueTime = dueTime;
    if (startTime !== undefined) chore.startTime = startTime;
    if (recurrence !== undefined) chore.recurrence = recurrence;
    if (recurrenceEndDate !== undefined) chore.recurrenceEndDate = recurrenceEndDate;

    await chore.save();

    await ChoreHistory.create({
      choreId: chore._id,
      householdId: household._id,
      userId: req.user._id,
      action: 'updated',
      notes: 'Chore details updated'
    });

    const populated = await Chore.findById(chore._id)
      .populate('assignedTo createdBy completedBy', 'name email profilePhoto');

    res.status(200).json({
      success: true,
      message: 'Chore updated successfully',
      data: { chore: populated }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a chore
// @route   DELETE /api/chores/:id
// @access  Private
exports.deleteChore = async (req, res, next) => {
  try {
    const household = await getUserHousehold(req.user._id);
    if (!household) {
      res.status(400);
      throw new Error('You must belong to a household');
    }

    const chore = await Chore.findById(req.params.id);
    if (!chore) {
      res.status(404);
      throw new Error('Chore not found');
    }

    if (chore.householdId.toString() !== household._id.toString()) {
      res.status(403);
      throw new Error('Unauthorized to delete this chore');
    }

    // Must be creator or household owner to delete
    const isCreator = chore.createdBy.toString() === req.user._id.toString();
    const isOwner = household.owner.toString() === req.user._id.toString();

    if (!isCreator && !isOwner) {
      res.status(403);
      throw new Error('Only the chore creator or household owner can delete this chore');
    }

    await Chore.deleteOne({ _id: chore._id });
    await ChoreHistory.deleteMany({ choreId: chore._id });

    res.status(200).json({
      success: true,
      message: 'Chore deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Claim an unassigned chore
// @route   POST /api/chores/:id/claim
// @access  Private
exports.claimChore = async (req, res, next) => {
  try {
    const household = await getUserHousehold(req.user._id);
    if (!household) {
      res.status(400);
      throw new Error('You must belong to a household');
    }

    const chore = await Chore.findById(req.params.id);
    if (!chore) {
      res.status(404);
      throw new Error('Chore not found');
    }

    if (chore.householdId.toString() !== household._id.toString()) {
      res.status(403);
      throw new Error('Unauthorized to claim this chore');
    }

    if (chore.status === 'completed' || chore.status === 'cancelled') {
      res.status(400);
      throw new Error('Cannot claim a completed or cancelled chore');
    }

    if (chore.assignedTo && chore.assignedTo.toString() === req.user._id.toString()) {
      res.status(400);
      throw new Error('You are already assigned to this chore');
    }

    const prevAssignee = chore.assignedTo;
    chore.assignedTo = req.user._id;
    chore.assignmentType = 'claimed';
    chore.status = 'assigned';
    await chore.save();

    await ChoreHistory.create({
      choreId: chore._id,
      householdId: household._id,
      userId: req.user._id,
      action: 'claimed',
      previousAssignee: prevAssignee,
      newAssignee: req.user._id,
      notes: `${req.user.name} claimed this chore`
    });

    const populated = await Chore.findById(chore._id)
      .populate('assignedTo createdBy completedBy', 'name email profilePhoto');

    res.status(200).json({
      success: true,
      message: 'Chore claimed successfully',
      data: { chore: populated }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Manually assign a chore to a roommate
// @route   POST /api/chores/:id/assign
// @access  Private
exports.assignChore = async (req, res, next) => {
  try {
    const household = await getUserHousehold(req.user._id);
    if (!household) {
      res.status(400);
      throw new Error('You must belong to a household');
    }

    const { userId } = req.body;
    if (!userId) {
      res.status(400);
      throw new Error('Please specify a userId to assign');
    }

    const isMember = household.members.some(m => m.toString() === userId.toString());
    if (!isMember) {
      res.status(400);
      throw new Error('Target user is not a member of this household');
    }

    const chore = await Chore.findById(req.params.id);
    if (!chore) {
      res.status(404);
      throw new Error('Chore not found');
    }

    if (chore.householdId.toString() !== household._id.toString()) {
      res.status(403);
      throw new Error('Unauthorized');
    }

    const prevAssignee = chore.assignedTo;
    chore.assignedTo = userId;
    chore.assignmentType = 'manual';
    chore.status = 'assigned';
    await chore.save();

    await ChoreHistory.create({
      choreId: chore._id,
      householdId: household._id,
      userId: req.user._id,
      action: prevAssignee ? 'reassigned' : 'assigned',
      previousAssignee: prevAssignee,
      newAssignee: userId,
      notes: `Manually assigned by ${req.user.name}`
    });

    const populated = await Chore.findById(chore._id)
      .populate('assignedTo createdBy completedBy', 'name email profilePhoto');

    const io = req.app.get('io');
    if (userId.toString() !== req.user._id.toString()) {
      await createNotification({
        userId,
        householdId: household._id,
        type: 'chore_assigned',
        title: 'Chore Assigned to You',
        message: `${req.user.name} assigned you the chore: "${chore.title}".`,
        entityType: 'chore',
        entityId: chore._id,
        io
      });
    }

    res.status(200).json({
      success: true,
      message: 'Chore assigned successfully',
      data: { chore: populated }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Complete a chore
// @route   POST /api/chores/:id/complete
// @access  Private
exports.completeChore = async (req, res, next) => {
  try {
    const household = await getUserHousehold(req.user._id);
    if (!household) {
      res.status(400);
      throw new Error('You must belong to a household');
    }

    const chore = await Chore.findById(req.params.id);
    if (!chore) {
      res.status(404);
      throw new Error('Chore not found');
    }

    if (chore.householdId.toString() !== household._id.toString()) {
      res.status(403);
      throw new Error('Unauthorized');
    }

    if (chore.status === 'completed') {
      res.status(400);
      throw new Error('Chore is already completed');
    }

    chore.status = 'completed';
    chore.completedAt = new Date();
    chore.completedBy = req.user._id;
    if (!chore.assignedTo) {
      chore.assignedTo = req.user._id;
    }
    await chore.save();

    await ChoreHistory.create({
      choreId: chore._id,
      householdId: household._id,
      userId: req.user._id,
      action: 'completed',
      notes: `Chore marked completed by ${req.user.name}`
    });

    const io = req.app.get('io');
    await logActivity({
      householdId: household._id,
      actor: req.user._id,
      type: 'chore_completed',
      message: `${req.user.name} completed "${chore.title}".`,
      entityType: 'chore',
      entityId: chore._id,
      io
    });

    // Notify creator if different user
    if (chore.createdBy && chore.createdBy.toString() !== req.user._id.toString()) {
      await createNotification({
        userId: chore.createdBy,
        householdId: household._id,
        type: 'chore_completed',
        title: 'Chore Completed',
        message: `${req.user.name} completed the chore "${chore.title}".`,
        entityType: 'chore',
        entityId: chore._id,
        io
      });
    }

    // Check if recurring, create next occurrence
    let nextOccurrence = null;
    if (chore.recurrence && chore.recurrence.type !== 'none') {
      nextOccurrence = await createNextOccurrence(chore, req.user._id);
    }

    const populated = await Chore.findById(chore._id)
      .populate('assignedTo createdBy completedBy', 'name email profilePhoto');

    res.status(200).json({
      success: true,
      message: 'Chore completed successfully',
      data: {
        chore: populated,
        nextOccurrence
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get smart recommendation for a chore
// @route   GET /api/chores/:id/recommendation
// @access  Private
exports.getSmartRecommendation = async (req, res, next) => {
  try {
    const household = await getUserHousehold(req.user._id);
    if (!household) {
      res.status(400);
      throw new Error('You must belong to a household');
    }

    const chore = await Chore.findById(req.params.id);
    if (!chore) {
      res.status(404);
      throw new Error('Chore not found');
    }

    if (chore.householdId.toString() !== household._id.toString()) {
      res.status(403);
      throw new Error('Unauthorized');
    }

    const recommendation = await recommendChoreAssignee(chore._id, household._id);

    if (!recommendation) {
      return res.status(200).json({
        success: true,
        data: null,
        message: 'No suitable roommate is currently available.'
      });
    }

    res.status(200).json({
      success: true,
      data: recommendation
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Confirm & assign smart recommendation
// @route   POST /api/chores/:id/assign-smart
// @access  Private
exports.assignSmartRecommendation = async (req, res, next) => {
  try {
    const household = await getUserHousehold(req.user._id);
    if (!household) {
      res.status(400);
      throw new Error('You must belong to a household');
    }

    const { userId, startTime, endTime } = req.body;
    if (!userId) {
      res.status(400);
      throw new Error('Please provide userId for smart assignment');
    }

    const isMember = household.members.some(m => m.toString() === userId.toString());
    if (!isMember) {
      res.status(400);
      throw new Error('Target user is not a household member');
    }

    const chore = await Chore.findById(req.params.id);
    if (!chore) {
      res.status(404);
      throw new Error('Chore not found');
    }

    if (chore.householdId.toString() !== household._id.toString()) {
      res.status(403);
      throw new Error('Unauthorized');
    }

    const prevAssignee = chore.assignedTo;
    chore.assignedTo = userId;
    chore.assignmentType = 'smart';
    chore.status = 'assigned';
    if (startTime) chore.startTime = startTime;
    await chore.save();

    await ChoreHistory.create({
      choreId: chore._id,
      householdId: household._id,
      userId: req.user._id,
      action: 'assigned',
      previousAssignee: prevAssignee,
      newAssignee: userId,
      notes: `Smart assignment confirmed for ${startTime || 'scheduled time'}`
    });

    const populated = await Chore.findById(chore._id)
      .populate('assignedTo createdBy completedBy', 'name email profilePhoto');

    res.status(200).json({
      success: true,
      message: 'Smart assignment confirmed successfully',
      data: { chore: populated }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get household chore completion history
// @route   GET /api/chores/history
// @access  Private
exports.getChoreHistory = async (req, res, next) => {
  try {
    const household = await getUserHousehold(req.user._id);
    if (!household) {
      res.status(400);
      throw new Error('You must belong to a household');
    }

    const limit = Number(req.query.limit) || 50;

    const history = await ChoreHistory.find({ householdId: household._id })
      .populate('userId previousAssignee newAssignee', 'name email profilePhoto')
      .populate({
        path: 'choreId',
        select: 'title category estimatedDuration priority dueDate dueTime status'
      })
      .sort({ timestamp: -1 })
      .limit(limit);

    res.status(200).json({
      success: true,
      data: { history }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get household workload statistics
// @route   GET /api/chores/workload
// @access  Private
exports.getHouseholdWorkload = async (req, res, next) => {
  try {
    const household = await getUserHousehold(req.user._id);
    if (!household) {
      res.status(400);
      throw new Error('You must belong to a household');
    }

    const workloads = await calculateHouseholdWorkloads(household._id);

    res.status(200).json({
      success: true,
      data: { workloads }
    });
  } catch (error) {
    next(error);
  }
};
