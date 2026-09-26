const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  createExpense,
  getExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
  recordPayment,
  getHouseholdBalances,
  getSimplifiedSettlements
} = require('../controllers/expenseController');

router.use(protect);

router.route('/')
  .post(createExpense)
  .get(getExpenses);

router.get('/balances', getHouseholdBalances);
router.get('/settlements', getSimplifiedSettlements);

router.route('/:id')
  .get(getExpenseById)
  .put(updateExpense)
  .delete(deleteExpense);

router.post('/:id/pay', recordPayment);

module.exports = router;
