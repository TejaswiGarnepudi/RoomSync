const Household = require('../models/Household');

const generateInviteCode = async () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let inviteCode;
  let isUnique = false;

  while (!isUnique) {
    inviteCode = '';
    for (let i = 0; i < 8; i++) {
      inviteCode += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    const existingHousehold = await Household.findOne({ inviteCode });
    if (!existingHousehold) {
      isUnique = true;
    }
  }

  return inviteCode;
};

module.exports = generateInviteCode;
