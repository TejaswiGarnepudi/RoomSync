const Availability = require('../models/Availability');
const {
  timeToMinutes,
  getUserHousehold,
  checkOverlap,
  getUserAvailability,
  getHouseholdAvailability,
  findCommonAvailability
} = require('../services/availabilityService');

// @desc    Create an availability block
// @route   POST /api/availability
// @access  Private
exports.createAvailability = async (req, res, next) => {
  try {
    const {
      date,
      startTime,
      endTime,
      status = 'available',
      title = '',
      visibility = 'household',
      recurrenceType = 'none',
      dayOfWeek,
      recurrenceEndDate = null
    } = req.body;

    const household = await getUserHousehold(req.user._id);
    if (!household) {
      res.status(400);
      throw new Error('You must be a member of a household to manage availability');
    }

    // Validate times
    if (!startTime || !endTime) {
      res.status(400);
      throw new Error('Please provide both startTime and endTime (format HH:MM)');
    }

    const startMins = timeToMinutes(startTime);
    const endMins = timeToMinutes(endTime);

    if (startMins >= endMins) {
      res.status(400);
      throw new Error('End time must be after start time');
    }

    // Validate recurrence and date
    if (recurrenceType === 'none') {
      if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        res.status(400);
        throw new Error('Please provide a valid date in YYYY-MM-DD format');
      }
    } else if (recurrenceType === 'weekly') {
      if (dayOfWeek === undefined || dayOfWeek === null || dayOfWeek < 0 || dayOfWeek > 6) {
        res.status(400);
        throw new Error('Please provide a valid dayOfWeek (0 for Sunday, 1 for Monday, ..., 6 for Saturday)');
      }
    } else {
      res.status(400);
      throw new Error('Invalid recurrenceType. Must be "none" or "weekly"');
    }

    // Check for overlapping blocks for this user
    const conflicting = await checkOverlap({
      userId: req.user._id,
      date,
      startTime,
      endTime,
      recurrenceType,
      dayOfWeek: Number(dayOfWeek)
    });

    if (conflicting) {
      res.status(400);
      throw new Error(`Time block overlaps with an existing availability block (${conflicting.startTime} - ${conflicting.endTime})`);
    }

    const availability = await Availability.create({
      userId: req.user._id,
      householdId: household._id,
      date: recurrenceType === 'none' ? date : null,
      startTime,
      endTime,
      status,
      title,
      visibility,
      recurrenceType,
      dayOfWeek: recurrenceType === 'weekly' ? Number(dayOfWeek) : undefined,
      recurrenceEndDate: recurrenceType === 'weekly' ? recurrenceEndDate : null
    });

    res.status(201).json({
      success: true,
      message: 'Availability block created successfully',
      data: { availability }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get authenticated user's availability
// @route   GET /api/availability/my
// @access  Private
exports.getMyAvailability = async (req, res, next) => {
  try {
    const household = await getUserHousehold(req.user._id);
    if (!household) {
      res.status(400);
      throw new Error('You must be a member of a household to view availability');
    }

    const { startDate, endDate } = req.query;

    const availability = await getUserAvailability({
      userId: req.user._id,
      householdId: household._id,
      startDate,
      endDate
    });

    res.status(200).json({
      success: true,
      data: { availability }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get household members' availability
// @route   GET /api/availability/household
// @access  Private
exports.getHouseholdAvailability = async (req, res, next) => {
  try {
    const household = await getUserHousehold(req.user._id);
    if (!household) {
      res.status(400);
      throw new Error('You must be a member of a household to view household availability');
    }

    const { startDate, endDate, memberIds } = req.query;
    let parsedMemberIds = null;
    if (memberIds) {
      parsedMemberIds = typeof memberIds === 'string' ? memberIds.split(',').map(s => s.trim()) : memberIds;
    }

    const availability = await getHouseholdAvailability({
      householdId: household._id,
      requestingUserId: req.user._id,
      startDate,
      endDate,
      memberIds: parsedMemberIds
    });

    res.status(200).json({
      success: true,
      data: { availability }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get common availability for household members
// @route   GET /api/availability/household/common
// @access  Private
exports.getCommonAvailability = async (req, res, next) => {
  try {
    const household = await getUserHousehold(req.user._id);
    if (!household) {
      res.status(400);
      throw new Error('You must be a member of a household to view common availability');
    }

    const { startDate, endDate, minimumDuration, memberIds } = req.query;

    if (!startDate || !endDate) {
      res.status(400);
      throw new Error('Please provide both startDate and endDate (YYYY-MM-DD)');
    }

    let parsedMemberIds = null;
    if (memberIds) {
      parsedMemberIds = typeof memberIds === 'string' ? memberIds.split(',').map(s => s.trim()) : memberIds;
    }

    const commonSlots = await findCommonAvailability({
      householdId: household._id,
      startDate,
      endDate,
      minimumDuration: minimumDuration ? Number(minimumDuration) : 30,
      requiredMembers: parsedMemberIds
    });

    res.status(200).json({
      success: true,
      data: commonSlots
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update an availability block
// @route   PUT /api/availability/:id
// @access  Private
exports.updateAvailability = async (req, res, next) => {
  try {
    const { id } = req.params;
    const availability = await Availability.findById(id);

    if (!availability) {
      res.status(404);
      throw new Error('Availability block not found');
    }

    if (availability.userId.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('You can only edit your own availability blocks');
    }

    const {
      date = availability.date,
      startTime = availability.startTime,
      endTime = availability.endTime,
      status = availability.status,
      title = availability.title,
      visibility = availability.visibility,
      recurrenceType = availability.recurrenceType,
      dayOfWeek = availability.dayOfWeek,
      recurrenceEndDate = availability.recurrenceEndDate
    } = req.body;

    const startMins = timeToMinutes(startTime);
    const endMins = timeToMinutes(endTime);

    if (startMins >= endMins) {
      res.status(400);
      throw new Error('End time must be after start time');
    }

    // Check overlap excluding current id
    const conflicting = await checkOverlap({
      userId: req.user._id,
      date,
      startTime,
      endTime,
      recurrenceType,
      dayOfWeek: dayOfWeek !== undefined ? Number(dayOfWeek) : undefined,
      excludeId: id
    });

    if (conflicting) {
      res.status(400);
      throw new Error(`Time block overlaps with an existing availability block (${conflicting.startTime} - ${conflicting.endTime})`);
    }

    availability.date = recurrenceType === 'none' ? date : null;
    availability.startTime = startTime;
    availability.endTime = endTime;
    availability.status = status;
    availability.title = title;
    availability.visibility = visibility;
    availability.recurrenceType = recurrenceType;
    availability.dayOfWeek = recurrenceType === 'weekly' ? Number(dayOfWeek) : undefined;
    availability.recurrenceEndDate = recurrenceType === 'weekly' ? recurrenceEndDate : null;

    await availability.save();

    res.status(200).json({
      success: true,
      message: 'Availability updated successfully',
      data: { availability }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete an availability block
// @route   DELETE /api/availability/:id
// @access  Private
exports.deleteAvailability = async (req, res, next) => {
  try {
    const { id } = req.params;
    const availability = await Availability.findById(id);

    if (!availability) {
      res.status(404);
      throw new Error('Availability block not found');
    }

    if (availability.userId.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('You can only delete your own availability blocks');
    }

    await availability.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Availability deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
