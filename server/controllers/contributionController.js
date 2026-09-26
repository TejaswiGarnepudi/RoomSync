const { getUserHousehold } = require('../services/availabilityService');
const { getHouseholdContributionSummary } = require('../services/contributionService');

// @desc    Get household contribution insights and member workload breakdown
// @route   GET /api/contribution
// @access  Private
exports.getContribution = async (req, res, next) => {
  try {
    const household = await getUserHousehold(req.user._id);
    if (!household) {
      res.status(400);
      throw new Error('You must belong to a household to view contribution insights');
    }

    const { period, startDate, endDate } = req.query;

    const summary = await getHouseholdContributionSummary({
      householdId: household._id,
      period: period || 'month',
      startDate,
      endDate,
      requestingUserId: req.user._id
    });

    res.status(200).json({
      success: true,
      data: summary
    });
  } catch (error) {
    next(error);
  }
};
