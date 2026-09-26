const Chore = require('../models/Chore');
const ChoreHistory = require('../models/ChoreHistory');
const Household = require('../models/Household');
const Availability = require('../models/Availability');
const {
  timeToMinutes,
  minutesToTime,
  getDayOfWeekFromDate,
  expandAvailabilityForDateRange
} = require('./availabilityService');
const { calculateHouseholdWorkloads } = require('./choreWorkloadService');

/**
 * Smart Rule-Based Chore Assignment Algorithm
 * Deterministic scoring based on:
 * 1. Availability match (45% weight)
 * 2. Workload balance (35% weight)
 * 3. Fair rotation history (20% weight)
 */
const recommendChoreAssignee = async (choreId, householdId) => {
  const chore = await Chore.findById(choreId);
  if (!chore) return null;

  const household = await Household.findById(householdId).populate('members', 'name email profilePhoto');
  if (!household || !household.members || household.members.length === 0) return null;

  const members = household.members;
  const choreDuration = chore.estimatedDuration || 30;
  const choreDate = chore.dueDate;
  const choreDueTimeMins = timeToMinutes(chore.dueTime || '23:59');

  // 1. Fetch Availability for chore date
  const allAvailability = await Availability.find({
    householdId,
    $or: [
      { recurrenceType: 'none', date: choreDate },
      { recurrenceType: 'weekly' }
    ]
  });

  const expandedAvailability = expandAvailabilityForDateRange(allAvailability, choreDate, choreDate);

  // 2. Fetch Workload metrics
  const workloads = await calculateHouseholdWorkloads(householdId);
  const workloadMap = {};
  workloads.forEach(w => {
    workloadMap[w.user._id.toString()] = w;
  });

  // 3. Fetch Category Completion History for Fair Rotation
  const recentHistory = await ChoreHistory.find({
    householdId,
    action: 'completed'
  }).sort({ timestamp: -1 }).limit(50).populate('choreId');

  const candidateScores = [];

  for (const member of members) {
    const mId = member._id.toString();
    const memberWorkload = workloadMap[mId] || { pendingMinutes: 0, pendingCount: 0, completedWeekCount: 0 };

    // --- A. Availability Matching ---
    const memberEvents = expandedAvailability.filter(e => {
      const eUserId = e.userId?._id ? e.userId._id.toString() : e.userId.toString();
      return eUserId === mId && e.effectiveDate === choreDate;
    });

    const availBlocks = memberEvents
      .filter(e => e.status === 'available')
      .map(e => ({ start: timeToMinutes(e.startTime), end: timeToMinutes(e.endTime) }));

    const busyBlocks = memberEvents
      .filter(e => e.status === 'busy')
      .map(e => ({ start: timeToMinutes(e.startTime), end: timeToMinutes(e.endTime) }));

    // Find free intervals (available minus busy)
    let cleanFreeIntervals = [];
    for (const avail of availBlocks) {
      let currentPieces = [avail];
      for (const busy of busyBlocks) {
        const nextPieces = [];
        for (const piece of currentPieces) {
          if (busy.end <= piece.start || busy.start >= piece.end) {
            nextPieces.push(piece);
          } else {
            if (piece.start < busy.start) {
              nextPieces.push({ start: piece.start, end: busy.start });
            }
            if (piece.end > busy.end) {
              nextPieces.push({ start: busy.end, end: piece.end });
            }
          }
        }
        currentPieces = nextPieces;
      }
      cleanFreeIntervals = cleanFreeIntervals.concat(currentPieces);
    }

    // Check if any free interval fits the chore duration and is on or before dueTime
    let bestSlot = null;
    let availabilityScore = 0;

    for (const slot of cleanFreeIntervals) {
      const slotDuration = slot.end - slot.start;
      if (slotDuration >= choreDuration) {
        // Ideal: slot starts and completes before or at dueTime
        if (slot.start + choreDuration <= choreDueTimeMins) {
          bestSlot = {
            start: slot.start,
            end: slot.start + choreDuration
          };
          availabilityScore = 100;
          break;
        } else if (!bestSlot) {
          // Fallback slot
          bestSlot = {
            start: slot.start,
            end: slot.start + choreDuration
          };
          availabilityScore = 60;
        }
      }
    }

    // Default slot if no explicit availability block defined (e.g. 1 hour before due time)
    if (!bestSlot) {
      const fallbackStart = Math.max(0, choreDueTimeMins - choreDuration);
      bestSlot = {
        start: fallbackStart,
        end: fallbackStart + choreDuration
      };
      // Check if candidate is busy during this fallback
      const isBusyDuringFallback = busyBlocks.some(b => 
        bestSlot.start < b.end && bestSlot.end > b.start
      );
      availabilityScore = isBusyDuringFallback ? 10 : 40;
    }

    // --- B. Workload Scoring ---
    // Lower pending minutes = higher score
    const pendingMins = memberWorkload.pendingMinutes || 0;
    const workloadScore = Math.max(10, 100 - (pendingMins * 1.5));

    // --- C. Rotation & History Scoring ---
    // Check when member last completed this category of chore
    let rotationScore = 80;
    let daysSinceLastSameCategory = 999;
    let lastDoneThisChore = false;

    const lastCompletedRecord = recentHistory.find(h => {
      const actorId = h.userId ? h.userId.toString() : null;
      return actorId === mId && h.choreId && h.choreId.category === chore.category;
    });

    if (lastCompletedRecord) {
      const diffMs = Date.now() - new Date(lastCompletedRecord.timestamp).getTime();
      daysSinceLastSameCategory = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      if (daysSinceLastSameCategory <= 2) {
        rotationScore = 20; // completed very recently
      } else if (daysSinceLastSameCategory <= 7) {
        rotationScore = 50;
      } else {
        rotationScore = 85;
      }
    } else {
      rotationScore = 100; // never done this category, give highest rotation priority
    }

    // Check if member was the very last person to complete this specific chore
    const veryLastChoreCompletion = recentHistory[0];
    if (veryLastChoreCompletion && veryLastChoreCompletion.userId && veryLastChoreCompletion.userId.toString() === mId) {
      rotationScore = Math.max(10, rotationScore - 15);
      lastDoneThisChore = true;
    }

    // --- D. Composite Weighted Total ---
    // Availability (45%), Workload (35%), Rotation (20%)
    const totalScore = (availabilityScore * 0.45) + (workloadScore * 0.35) + (rotationScore * 0.20);

    // Build friendly bullet explanations
    const reasons = [];
    if (availabilityScore >= 80) {
      reasons.push(`Available during required time (${minutesToTime(bestSlot.start)} – ${minutesToTime(bestSlot.end)})`);
    } else if (availabilityScore >= 40) {
      reasons.push(`Has open schedule before deadline`);
    }

    if (pendingMins === 0) {
      reasons.push(`Has zero pending chore workload`);
    } else if (pendingMins <= 45) {
      reasons.push(`Has lower current workload (${pendingMins} mins pending)`);
    }

    if (rotationScore >= 80) {
      reasons.push(`Maintains fair rotation (has not done ${chore.category} chores recently)`);
    }

    if (reasons.length === 0) {
      reasons.push(`Available roommate in household`);
    }

    candidateScores.push({
      user: {
        _id: member._id,
        name: member.name,
        email: member.email,
        profilePhoto: member.profilePhoto
      },
      startTime: minutesToTime(bestSlot.start),
      endTime: minutesToTime(bestSlot.end),
      availabilityScore,
      workloadScore,
      rotationScore,
      totalScore,
      reasons
    });
  }

  // Sort candidates by totalScore descending, tiebreak deterministically by name
  candidateScores.sort((a, b) => {
    if (b.totalScore !== a.totalScore) {
      return b.totalScore - a.totalScore;
    }
    return a.user.name.localeCompare(b.user.name);
  });

  const topCandidate = candidateScores[0];
  if (!topCandidate) return null;

  return {
    chore: {
      _id: chore._id,
      title: chore.title,
      category: chore.category,
      estimatedDuration: chore.estimatedDuration,
      dueDate: chore.dueDate,
      dueTime: chore.dueTime
    },
    recommendedUser: topCandidate.user,
    startTime: topCandidate.startTime,
    endTime: topCandidate.endTime,
    reasons: topCandidate.reasons,
    confidenceScore: Math.round(topCandidate.totalScore),
    allCandidates: candidateScores.map(c => ({
      userId: c.user._id,
      name: c.user.name,
      totalScore: Math.round(c.totalScore),
      startTime: c.startTime,
      endTime: c.endTime,
      reasons: c.reasons
    }))
  };
};

module.exports = {
  recommendChoreAssignee
};
