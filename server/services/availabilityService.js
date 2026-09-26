const Availability = require('../models/Availability');
const Household = require('../models/Household');

// Helper: Convert "HH:MM" (24h) to minutes from midnight
const timeToMinutes = (timeStr) => {
  if (!timeStr || typeof timeStr !== 'string') return 0;
  const [hours, minutes] = timeStr.split(':').map(Number);
  return (hours * 60) + (minutes || 0);
};

// Helper: Convert minutes from midnight back to "HH:MM"
const minutesToTime = (minutes) => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

// Helper: Get day of week (0=Sun, 1=Mon, ..., 6=Sat) for a "YYYY-MM-DD" string
const getDayOfWeekFromDate = (dateStr) => {
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  return d.getDay();
};

// Helper: Generate array of "YYYY-MM-DD" strings between startDate and endDate inclusive
const getDateRangeArray = (startDate, endDate) => {
  const dates = [];
  const [sY, sM, sD] = startDate.split('-').map(Number);
  const [eY, eM, eD] = endDate.split('-').map(Number);
  const start = new Date(sY, sM - 1, sD);
  const end = new Date(eY, eM - 1, eD);

  const curr = new Date(start);
  while (curr <= end) {
    const y = curr.getFullYear();
    const m = String(curr.getMonth() + 1).padStart(2, '0');
    const d = String(curr.getDate()).padStart(2, '0');
    dates.push(`${y}-${m}-${d}`);
    curr.setDate(curr.getDate() + 1);
  }
  return dates;
};

// Check if two time intervals overlap (strictly: startA < endB && startB < endA)
const doIntervalsOverlap = (startA, endA, startB, endB) => {
  return timeToMinutes(startA) < timeToMinutes(endB) && timeToMinutes(startB) < timeToMinutes(endA);
};

// Get the user's active household
const getUserHousehold = async (userId) => {
  return await Household.findOne({ members: userId });
};

// Check for conflicting/overlapping availability blocks for a user
const checkOverlap = async ({ userId, date, startTime, endTime, recurrenceType, dayOfWeek, excludeId = null }) => {
  const query = { userId };
  if (excludeId) {
    query._id = { $ne: excludeId };
  }

  if (recurrenceType === 'none') {
    // Check against one-time items on same date
    const targetDayOfWeek = getDayOfWeekFromDate(date);
    const existing = await Availability.find({
      ...query,
      $or: [
        { recurrenceType: 'none', date },
        { recurrenceType: 'weekly', dayOfWeek: targetDayOfWeek }
      ]
    });

    for (const item of existing) {
      if (doIntervalsOverlap(startTime, endTime, item.startTime, item.endTime)) {
        return item;
      }
    }
  } else if (recurrenceType === 'weekly') {
    // Check against recurring items on same dayOfWeek and one-time items on matching dates
    const existing = await Availability.find({
      ...query,
      $or: [
        { recurrenceType: 'weekly', dayOfWeek },
        { recurrenceType: 'none' } // will filter by dayOfWeek
      ]
    });

    for (const item of existing) {
      if (item.recurrenceType === 'none') {
        const itemDay = getDayOfWeekFromDate(item.date);
        if (itemDay !== dayOfWeek) continue;
      }
      if (doIntervalsOverlap(startTime, endTime, item.startTime, item.endTime)) {
        return item;
      }
    }
  }

  return null;
};

/**
 * Expand availability records (both one-time and recurring) for a list of records into concrete dates
 */
const expandAvailabilityForDateRange = (records, startDate, endDate) => {
  const dateList = getDateRangeArray(startDate, endDate);
  const expanded = [];

  for (const dateStr of dateList) {
    const dayOfWeek = getDayOfWeekFromDate(dateStr);

    for (const rec of records) {
      if (rec.recurrenceType === 'none') {
        if (rec.date === dateStr) {
          expanded.push({
            ...rec.toObject ? rec.toObject() : rec,
            effectiveDate: dateStr,
            isRecurringInstance: false
          });
        }
      } else if (rec.recurrenceType === 'weekly') {
        if (rec.dayOfWeek === dayOfWeek) {
          if (!rec.recurrenceEndDate || rec.recurrenceEndDate >= dateStr) {
            expanded.push({
              ...rec.toObject ? rec.toObject() : rec,
              effectiveDate: dateStr,
              isRecurringInstance: true
            });
          }
        }
      }
    }
  }

  return expanded;
};

/**
 * Get personal availability for a user, including assigned chores
 */
const getUserAvailability = async ({ userId, householdId, startDate, endDate }) => {
  const query = { userId, householdId };

  let availabilityItems = [];
  if (startDate && endDate) {
    const records = await Availability.find({
      userId,
      householdId,
      $or: [
        { recurrenceType: 'none', date: { $gte: startDate, $lte: endDate } },
        { recurrenceType: 'weekly' }
      ]
    }).sort({ startTime: 1 });

    availabilityItems = expandAvailabilityForDateRange(records, startDate, endDate);
  } else {
    availabilityItems = await Availability.find(query).sort({ date: 1, dayOfWeek: 1, startTime: 1 });
  }

  // Include assigned chores for this user
  const Chore = require('../models/Chore');
  const choreQuery = {
    householdId,
    assignedTo: userId,
    status: { $in: ['assigned', 'in_progress', 'completed', 'overdue'] }
  };
  if (startDate && endDate) {
    choreQuery.dueDate = { $gte: startDate, $lte: endDate };
  }

  const userChores = await Chore.find(choreQuery);
  const choreItems = userChores.map(chore => {
    const choreDueMins = timeToMinutes(chore.dueTime || '18:00');
    const choreDuration = chore.estimatedDuration || 30;
    const startMins = chore.startTime ? timeToMinutes(chore.startTime) : Math.max(0, choreDueMins - choreDuration);
    const endMins = startMins + choreDuration;

    return {
      _id: chore._id,
      userId: chore.assignedTo,
      householdId: chore.householdId,
      effectiveDate: chore.dueDate,
      date: chore.dueDate,
      startTime: minutesToTime(startMins),
      endTime: minutesToTime(endMins),
      status: 'chore',
      choreStatus: chore.status,
      title: `🧹 ${chore.title}`,
      choreCategory: chore.category,
      chorePriority: chore.priority,
      isChore: true,
      isCompleted: chore.status === 'completed',
      visibility: 'household'
    };
  });

  // Include assigned shopping trips for this user
  const ShoppingList = require('../models/ShoppingList');
  const shoppingQuery = {
    householdId,
    assignedTo: userId,
    status: { $in: ['planned', 'in_progress', 'completed'] }
  };
  if (startDate && endDate) {
    shoppingQuery.shoppingDate = { $gte: startDate, $lte: endDate };
  }

  const userShopping = await ShoppingList.find(shoppingQuery);
  const shoppingItems = userShopping.map(list => {
    const startMins = timeToMinutes(list.shoppingTime || '17:00');
    const endMins = startMins + 45;

    return {
      _id: list._id,
      userId: list.assignedTo,
      householdId: list.householdId,
      effectiveDate: list.shoppingDate,
      date: list.shoppingDate,
      startTime: minutesToTime(startMins),
      endTime: minutesToTime(endMins),
      status: 'shopping',
      shoppingStatus: list.status,
      title: `🛒 ${list.name}`,
      isShopping: true,
      isCompleted: list.status === 'completed',
      visibility: 'household'
    };
  });

  // Include accepted/in-progress help assistance for this user (as helper or requester)
  const HelpRequest = require('../models/HelpRequest');
  const helpQuery = {
    householdId,
    $or: [{ requester: userId }, { acceptedBy: userId }],
    status: { $in: ['accepted', 'in_progress', 'completed'] }
  };
  if (startDate && endDate) {
    helpQuery.date = { $gte: startDate, $lte: endDate };
  }

  const userHelpRequests = await HelpRequest.find(helpQuery);
  const helpItems = userHelpRequests.map(help => ({
    _id: help._id,
    userId: help.acceptedBy || help.requester,
    householdId: help.householdId,
    effectiveDate: help.date,
    date: help.date,
    startTime: help.startTime,
    endTime: help.endTime,
    status: 'help',
    helpStatus: help.status,
    title: `🤝 Help: ${help.title}`,
    isHelp: true,
    isCompleted: help.status === 'completed',
    visibility: 'household'
  }));

  return [...availabilityItems, ...choreItems, ...shoppingItems, ...helpItems].sort((a, b) => a.startTime.localeCompare(b.startTime));
};

/**
 * Get household availability respecting privacy, including assigned chores, shopping trips, and help events
 */
const getHouseholdAvailability = async ({ householdId, requestingUserId, startDate, endDate, memberIds = null }) => {
  const filter = { householdId };
  if (memberIds && memberIds.length > 0) {
    filter.userId = { $in: memberIds };
  }

  let formattedAvailability = [];
  if (startDate && endDate) {
    const rawRecords = await Availability.find({
      ...filter,
      $or: [
        { recurrenceType: 'none', date: { $gte: startDate, $lte: endDate } },
        { recurrenceType: 'weekly' }
      ]
    })
    .populate('userId', 'name email profilePhoto')
    .sort({ startTime: 1 });

    const expanded = expandAvailabilityForDateRange(rawRecords, startDate, endDate);

    // Apply privacy masking
    formattedAvailability = expanded.map(item => {
      const isOwner = item.userId?._id?.toString() === requestingUserId.toString() ||
                      item.userId?.toString() === requestingUserId.toString();

      if (!isOwner && item.visibility === 'private') {
        return {
          ...item,
          title: item.status === 'available' ? 'Available' : 'Busy'
        };
      }
      return item;
    });
  } else {
    const rawRecords = await Availability.find(filter)
      .populate('userId', 'name email profilePhoto')
      .sort({ date: 1, dayOfWeek: 1, startTime: 1 });

    formattedAvailability = rawRecords.map(rec => {
      const item = rec.toObject();
      const isOwner = item.userId?._id?.toString() === requestingUserId.toString();

      if (!isOwner && item.visibility === 'private') {
        item.title = item.status === 'available' ? 'Available' : 'Busy';
      }
      return item;
    });
  }

  // Include assigned household chores
  const Chore = require('../models/Chore');
  const choreFilter = {
    householdId,
    assignedTo: { $ne: null },
    status: { $in: ['assigned', 'in_progress', 'completed', 'overdue'] }
  };
  if (memberIds && memberIds.length > 0) {
    choreFilter.assignedTo = { $in: memberIds };
  }
  if (startDate && endDate) {
    choreFilter.dueDate = { $gte: startDate, $lte: endDate };
  }

  const householdChores = await Chore.find(choreFilter)
    .populate('assignedTo', 'name email profilePhoto');

  const choreEvents = householdChores.map(chore => {
    const choreDueMins = timeToMinutes(chore.dueTime || '18:00');
    const choreDuration = chore.estimatedDuration || 30;
    const startMins = chore.startTime ? timeToMinutes(chore.startTime) : Math.max(0, choreDueMins - choreDuration);
    const endMins = startMins + choreDuration;

    return {
      _id: chore._id,
      userId: chore.assignedTo,
      householdId: chore.householdId,
      effectiveDate: chore.dueDate,
      date: chore.dueDate,
      startTime: minutesToTime(startMins),
      endTime: minutesToTime(endMins),
      status: 'chore',
      choreStatus: chore.status,
      title: `🧹 ${chore.title}`,
      choreCategory: chore.category,
      chorePriority: chore.priority,
      isChore: true,
      isCompleted: chore.status === 'completed',
      visibility: 'household'
    };
  });

  // Include household shopping trips
  const ShoppingList = require('../models/ShoppingList');
  const shoppingFilter = {
    householdId,
    status: { $in: ['planned', 'in_progress', 'completed'] }
  };
  if (memberIds && memberIds.length > 0) {
    shoppingFilter.assignedTo = { $in: memberIds };
  }
  if (startDate && endDate) {
    shoppingFilter.shoppingDate = { $gte: startDate, $lte: endDate };
  }

  const householdShopping = await ShoppingList.find(shoppingFilter)
    .populate('assignedTo', 'name email profilePhoto');

  const shoppingEvents = householdShopping.map(list => {
    const startMins = timeToMinutes(list.shoppingTime || '17:00');
    const endMins = startMins + 45;

    return {
      _id: list._id,
      userId: list.assignedTo,
      householdId: list.householdId,
      effectiveDate: list.shoppingDate,
      date: list.shoppingDate,
      startTime: minutesToTime(startMins),
      endTime: minutesToTime(endMins),
      status: 'shopping',
      shoppingStatus: list.status,
      title: `🛒 ${list.name}`,
      isShopping: true,
      isCompleted: list.status === 'completed',
      visibility: 'household'
    };
  });

  // Include household help assistance events
  const HelpRequest = require('../models/HelpRequest');
  const helpFilter = {
    householdId,
    status: { $in: ['accepted', 'in_progress', 'completed'] }
  };
  if (memberIds && memberIds.length > 0) {
    helpFilter.$or = [{ requester: { $in: memberIds } }, { acceptedBy: { $in: memberIds } }];
  }
  if (startDate && endDate) {
    helpFilter.date = { $gte: startDate, $lte: endDate };
  }

  const householdHelp = await HelpRequest.find(helpFilter)
    .populate('requester acceptedBy', 'name email profilePhoto');

  const helpEvents = householdHelp.map(help => ({
    _id: help._id,
    userId: help.acceptedBy || help.requester,
    householdId: help.householdId,
    effectiveDate: help.date,
    date: help.date,
    startTime: help.startTime,
    endTime: help.endTime,
    status: 'help',
    helpStatus: help.status,
    title: `🤝 Help: ${help.title}`,
    isHelp: true,
    isCompleted: help.status === 'completed',
    visibility: 'household'
  }));

  return [...formattedAvailability, ...choreEvents, ...shoppingEvents, ...helpEvents].sort((a, b) => a.startTime.localeCompare(b.startTime));
};

/**
 * Find common available time slots for household members
 * Strategy:
 * 1. For each date in range:
 * 2. Get list of active members
 * 3. For each member, identify intervals where they are "available" (and not "busy")
 * 4. Intersect the intervals across all required members
 * 5. Return common intervals with duration >= minimumDuration
 */
const findCommonAvailability = async ({ householdId, startDate, endDate, minimumDuration = 30, requiredMembers = null }) => {
  const household = await Household.findById(householdId).populate('members', 'name email profilePhoto');
  if (!household) return [];

  let targetMembers = household.members;
  if (requiredMembers && requiredMembers.length > 0) {
    targetMembers = household.members.filter(m => requiredMembers.includes(m._id.toString()));
  }

  if (targetMembers.length === 0) return [];

  const targetMemberIds = targetMembers.map(m => m._id.toString());
  const dateList = getDateRangeArray(startDate, endDate);

  // Fetch all availability records for these members
  const allRecords = await Availability.find({
    householdId,
    userId: { $in: targetMemberIds },
    $or: [
      { recurrenceType: 'none', date: { $gte: startDate, $lte: endDate } },
      { recurrenceType: 'weekly' }
    ]
  });

  const expandedRecords = expandAvailabilityForDateRange(allRecords, startDate, endDate);
  const results = [];

  for (const dateStr of dateList) {
    // For each member, compute their available intervals for this date
    // An interval [start, end] is available if it is covered by an "available" block and not covered by any "busy" block
    const memberAvailableIntervals = {};

    for (const member of targetMembers) {
      const mId = member._id.toString();
      const memberEvents = expandedRecords.filter(r => 
        (r.userId._id ? r.userId._id.toString() : r.userId.toString()) === mId &&
        r.effectiveDate === dateStr
      );

      // Collect explicitly available intervals
      const availIntervals = memberEvents
        .filter(e => e.status === 'available')
        .map(e => ({ start: timeToMinutes(e.startTime), end: timeToMinutes(e.endTime) }));

      // Collect busy intervals
      const busyIntervals = memberEvents
        .filter(e => e.status === 'busy')
        .map(e => ({ start: timeToMinutes(e.startTime), end: timeToMinutes(e.endTime) }));

      // Subtract busy intervals from availIntervals
      let cleanIntervals = [];
      for (const avail of availIntervals) {
        let currentPieces = [avail];

        for (const busy of busyIntervals) {
          const nextPieces = [];
          for (const piece of currentPieces) {
            // No overlap
            if (busy.end <= piece.start || busy.start >= piece.end) {
              nextPieces.push(piece);
            } else {
              // Overlap: piece before busy
              if (piece.start < busy.start) {
                nextPieces.push({ start: piece.start, end: busy.start });
              }
              // Piece after busy
              if (piece.end > busy.end) {
                nextPieces.push({ start: busy.end, end: piece.end });
              }
            }
          }
          currentPieces = nextPieces;
        }

        cleanIntervals = cleanIntervals.concat(currentPieces);
      }

      memberAvailableIntervals[mId] = cleanIntervals;
    }

    // Now intersect the cleanIntervals across all target members
    let commonIntervals = memberAvailableIntervals[targetMemberIds[0]] || [];

    for (let i = 1; i < targetMemberIds.length; i++) {
      const nextMemberIntervals = memberAvailableIntervals[targetMemberIds[i]] || [];
      const intersected = [];

      for (const a of commonIntervals) {
        for (const b of nextMemberIntervals) {
          const maxStart = Math.max(a.start, b.start);
          const minEnd = Math.min(a.end, b.end);
          if (maxStart < minEnd) {
            intersected.push({ start: maxStart, end: minEnd });
          }
        }
      }
      commonIntervals = intersected;
    }

    // Filter by minimum duration and format results
    for (const interval of commonIntervals) {
      const duration = interval.end - interval.start;
      if (duration >= minimumDuration) {
        results.push({
          date: dateStr,
          startTime: minutesToTime(interval.start),
          endTime: minutesToTime(interval.end),
          durationMinutes: duration,
          availableMembers: targetMembers.map(m => ({
            _id: m._id,
            name: m.name,
            email: m.email,
            profilePhoto: m.profilePhoto
          }))
        });
      }
    }
  }

  return results;
};

module.exports = {
  timeToMinutes,
  minutesToTime,
  getDayOfWeekFromDate,
  getDateRangeArray,
  getUserHousehold,
  checkOverlap,
  expandAvailabilityForDateRange,
  getUserAvailability,
  getHouseholdAvailability,
  findCommonAvailability
};
