const Household = require('../models/Household');
const Availability = require('../models/Availability');
const Chore = require('../models/Chore');
const HelpRequest = require('../models/HelpRequest');
const {
  timeToMinutes,
  minutesToTime,
  getDayOfWeekFromDate,
  expandAvailabilityForDateRange
} = require('./availabilityService');

/**
 * Check if time interval A covers time interval B completely
 */
const doesIntervalCover = (startA, endA, startB, endB) => {
  return timeToMinutes(startA) <= timeToMinutes(startB) && timeToMinutes(endA) >= timeToMinutes(endB);
};

/**
 * Check if intervals overlap
 */
const doIntervalsOverlap = (startA, endA, startB, endB) => {
  return timeToMinutes(startA) < timeToMinutes(endB) && timeToMinutes(startB) < timeToMinutes(endA);
};

/**
 * Recommend available household helpers for a help request
 */
const getHelpRecommendations = async (helpRequest) => {
  const { householdId, requester, date, startTime, endTime } = helpRequest;
  const requesterId = requester?._id ? requester._id.toString() : requester.toString();

  const household = await Household.findById(householdId).populate('members', 'name email profilePhoto');
  if (!household) return [];

  // Filter candidates (all household members except the requester)
  const candidateMembers = household.members.filter(m => m._id.toString() !== requesterId);
  if (candidateMembers.length === 0) return [];

  const candidateIds = candidateMembers.map(m => m._id.toString());
  const dayOfWeek = getDayOfWeekFromDate(date);

  // 1. Fetch candidate availability blocks
  const rawAvailability = await Availability.find({
    householdId,
    userId: { $in: candidateIds },
    $or: [
      { recurrenceType: 'none', date },
      { recurrenceType: 'weekly', dayOfWeek }
    ]
  });

  const expandedAvailability = expandAvailabilityForDateRange(rawAvailability, date, date);

  // 2. Fetch candidate assigned chores on that date
  const candidateChores = await Chore.find({
    householdId,
    assignedTo: { $in: candidateIds },
    dueDate: date,
    status: { $in: ['assigned', 'in_progress'] }
  });

  // 3. Fetch candidate other accepted help requests on that date
  const candidateOtherHelp = await HelpRequest.find({
    householdId,
    _id: { $ne: helpRequest._id },
    acceptedBy: { $in: candidateIds },
    date,
    status: { $in: ['accepted', 'in_progress'] }
  });

  const recommendations = [];

  for (const candidate of candidateMembers) {
    const cId = candidate._id.toString();

    const memberAvail = expandedAvailability.filter(a => {
      const uId = a.userId?._id ? a.userId._id.toString() : a.userId.toString();
      return uId === cId;
    });

    const memberChores = candidateChores.filter(c => c.assignedTo.toString() === cId);
    const memberHelp = candidateOtherHelp.filter(h => h.acceptedBy.toString() === cId);

    // Check for busy availability blocks overlapping the request
    const busyBlocks = memberAvail.filter(a => a.status === 'busy');
    const hasBusyConflict = busyBlocks.some(b => doIntervalsOverlap(b.startTime, b.endTime, startTime, endTime));

    // Check for chore time conflict
    const hasChoreConflict = memberChores.some(c => {
      const cDue = c.dueTime || '18:00';
      const cDur = c.estimatedDuration || 30;
      const cStart = c.startTime || minutesToTime(Math.max(0, timeToMinutes(cDue) - cDur));
      const cEnd = minutesToTime(timeToMinutes(cStart) + cDur);
      return doIntervalsOverlap(cStart, cEnd, startTime, endTime);
    });

    // Check for other help commitment conflict
    const hasHelpConflict = memberHelp.some(h => doIntervalsOverlap(h.startTime, h.endTime, startTime, endTime));

    // Check for available blocks covering the requested time
    const availableBlocks = memberAvail.filter(a => a.status === 'available');
    const coveringAvailableBlock = availableBlocks.find(a => doesIntervalCover(a.startTime, a.endTime, startTime, endTime));
    const overlappingAvailableBlock = availableBlocks.find(a => doIntervalsOverlap(a.startTime, a.endTime, startTime, endTime));

    let matchType = 'unavailable';
    let score = 0;
    const reasons = [];

    if (hasBusyConflict) {
      reasons.push('Has a scheduled busy block during this time');
    } else if (hasChoreConflict) {
      reasons.push('Has an assigned chore overlapping this time');
    } else if (hasHelpConflict) {
      reasons.push('Already committed to another help request at this time');
    } else if (coveringAvailableBlock) {
      matchType = 'full_match';
      score = 100;
      reasons.push(`Explicitly marked available from ${coveringAvailableBlock.startTime} to ${coveringAvailableBlock.endTime}`);
      reasons.push('No conflicting chores or other commitments');
    } else if (overlappingAvailableBlock) {
      matchType = 'partial_match';
      score = 70;
      reasons.push(`Partially available (${overlappingAvailableBlock.startTime} – ${overlappingAvailableBlock.endTime})`);
    } else {
      // Free by default (no explicit busy block or conflicting chores)
      matchType = 'free_schedule';
      score = 50;
      reasons.push('No schedule conflicts recorded on calendar');
    }

    recommendations.push({
      member: {
        _id: candidate._id,
        name: candidate.name,
        email: candidate.email,
        profilePhoto: candidate.profilePhoto
      },
      user: {
        _id: candidate._id,
        name: candidate.name,
        email: candidate.email,
        profilePhoto: candidate.profilePhoto
      },
      matchType,
      status: matchType,
      isAvailable: matchType !== 'unavailable',
      score,
      reasons
    });
  }

  // Sort: full_match first, then partial_match, then free_schedule, then unavailable
  recommendations.sort((a, b) => b.score - a.score);

  return recommendations;
};

module.exports = {
  getHelpRecommendations
};
