/**
 * Debt Simplification Algorithm
 * Minimizes the total number of peer-to-peer transactions required to settle all debts in a household.
 */
const simplifyDebts = (memberBalances) => {
  if (!memberBalances || memberBalances.length === 0) return [];

  // Separate debtors (< 0) and creditors (> 0)
  const debtors = [];
  const creditors = [];

  memberBalances.forEach(m => {
    const net = Math.round(m.netBalance * 100) / 100;
    if (net < -0.01) {
      debtors.push({
        user: m.user,
        amount: -net // positive debt value
      });
    } else if (net > 0.01) {
      creditors.push({
        user: m.user,
        amount: net
      });
    }
  });

  // Sort descending by amount
  debtors.sort((a, b) => b.amount - a.amount);
  creditors.sort((a, b) => b.amount - a.amount);

  const settlements = [];
  let dIdx = 0;
  let cIdx = 0;

  while (dIdx < debtors.length && cIdx < creditors.length) {
    const debtor = debtors[dIdx];
    const creditor = creditors[cIdx];

    const settledAmount = Math.min(debtor.amount, creditor.amount);

    if (settledAmount > 0.01) {
      const fromId = debtor.user?._id ? debtor.user._id.toString() : debtor.user ? debtor.user.toString() : debtor.userId;
      const toId = creditor.user?._id ? creditor.user._id.toString() : creditor.user ? creditor.user.toString() : creditor.userId;
      const fromName = debtor.user?.name || debtor.name || 'Roommate';
      const toName = creditor.user?.name || creditor.name || 'Roommate';

      settlements.push({
        from: debtor.user,
        to: creditor.user,
        fromUserId: fromId,
        fromUserName: fromName,
        toUserId: toId,
        toUserName: toName,
        amount: Math.round(settledAmount * 100) / 100
      });
    }

    debtor.amount -= settledAmount;
    creditor.amount -= settledAmount;

    if (debtor.amount < 0.01) {
      dIdx++;
    }
    if (creditor.amount < 0.01) {
      cIdx++;
    }
  }

  return settlements;
};

module.exports = {
  simplifyDebts
};
