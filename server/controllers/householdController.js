const Household = require('../models/Household');
const generateInviteCode = require('../utils/generateInviteCode');

exports.createHousehold = async (req, res, next) => {
  try {
    const { name } = req.body;

    if (!name) {
      res.status(400);
      throw new Error('Please provide a household name');
    }

    const existingMembership = await Household.findOne({ members: req.user._id });
    if (existingMembership) {
      res.status(400);
      throw new Error('You are already a member of a household');
    }

    const inviteCode = await generateInviteCode();

    let household = await Household.create({
      name,
      owner: req.user._id,
      members: [req.user._id],
      inviteCode
    });

    household = await household.populate('owner members', 'name email profilePhoto');

    res.status(201).json({
      success: true,
      message: 'Household created successfully',
      data: { household }
    });
  } catch (error) {
    next(error);
  }
};

exports.getMyHousehold = async (req, res, next) => {
  try {
    const household = await Household.findOne({ members: req.user._id })
      .populate('owner members', 'name email profilePhoto');

    if (!household) {
      res.status(404);
      throw new Error('You are not a member of any household');
    }

    res.status(200).json({
      success: true,
      data: { household }
    });
  } catch (error) {
    next(error);
  }
};

exports.joinHousehold = async (req, res, next) => {
  try {
    const { inviteCode } = req.body;

    if (!inviteCode) {
      res.status(400);
      throw new Error('Please provide an invite code');
    }

    const existingMembership = await Household.findOne({ members: req.user._id });
    if (existingMembership) {
      res.status(400);
      throw new Error('You are already a member of a household');
    }

    // Case-insensitive find for invite code
    const household = await Household.findOne({ inviteCode: new RegExp('^' + inviteCode + '$', 'i') });

    if (!household) {
      res.status(404);
      throw new Error('Invalid invite code');
    }

    if (household.members.includes(req.user._id)) {
      res.status(400);
      throw new Error('You are already a member of this household');
    }

    household.members.push(req.user._id);
    await household.save();

    await household.populate('owner members', 'name email profilePhoto');

    res.status(200).json({
      success: true,
      message: 'Successfully joined household',
      data: { household }
    });
  } catch (error) {
    next(error);
  }
};

exports.leaveHousehold = async (req, res, next) => {
  try {
    const household = await Household.findOne({ members: req.user._id });

    if (!household) {
      res.status(404);
      throw new Error('Household not found');
    }

    if (household.owner.toString() === req.user._id.toString()) {
      res.status(400);
      throw new Error('Owner cannot leave the household. Transfer ownership or delete it.');
    }

    household.members = household.members.filter(
      member => member.toString() !== req.user._id.toString()
    );

    await household.save();

    res.status(200).json({
      success: true,
      message: 'Successfully left the household'
    });
  } catch (error) {
    next(error);
  }
};

exports.removeMember = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const household = await Household.findOne({ members: req.user._id });

    if (!household) {
      res.status(404);
      throw new Error('Household not found');
    }

    if (household.owner.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Only the household owner can remove members');
    }

    if (userId.toString() === req.user._id.toString()) {
      res.status(400);
      throw new Error('Owner cannot be removed');
    }

    if (!household.members.includes(userId)) {
      res.status(404);
      throw new Error('User is not a member of this household');
    }

    household.members = household.members.filter(
      member => member.toString() !== userId.toString()
    );

    await household.save();
    
    await household.populate('owner members', 'name email profilePhoto');

    res.status(200).json({
      success: true,
      message: 'Member removed successfully',
      data: { household }
    });
  } catch (error) {
    next(error);
  }
};

exports.regenerateInviteCode = async (req, res, next) => {
  try {
    const household = await Household.findOne({ members: req.user._id });

    if (!household) {
      res.status(404);
      throw new Error('Household not found');
    }

    if (household.owner.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Only the household owner can regenerate invite code');
    }

    const newInviteCode = await generateInviteCode();
    household.inviteCode = newInviteCode;
    await household.save();

    res.status(200).json({
      success: true,
      message: 'Invite code regenerated',
      data: { inviteCode: household.inviteCode }
    });
  } catch (error) {
    next(error);
  }
};
