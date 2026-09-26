const { getUserHousehold } = require('../services/availabilityService');
const { getDashboardSummary } = require('../services/coordinationSummaryService');

// @desc    Get consolidated dashboard coordination summary
// @route   GET /api/dashboard/summary
// @access  Private
exports.getSummary = async (req, res, next) => {
  try {
    const household = await getUserHousehold(req.user._id);
    if (!household) {
      return res.status(200).json({
        success: true,
        data: null
      });
    }

    const summary = await getDashboardSummary(req.user._id, household._id);

    res.status(200).json({
      success: true,
      data: summary
    });
  } catch (error) {
    next(error);
  }
};
