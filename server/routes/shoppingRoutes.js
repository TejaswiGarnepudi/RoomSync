const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  createShoppingList,
  getShoppingLists,
  getShoppingListById,
  updateShoppingList,
  deleteShoppingList,
  addItemToList,
  updateShoppingItem,
  deleteShoppingItem,
  createRecurringItem,
  getRecurringItems,
  updateRecurringItem,
  deleteRecurringItem,
  getUpcomingShopping,
  generateExpenseFromList
} = require('../controllers/shoppingController');

router.use(protect);

router.route('/lists')
  .post(createShoppingList)
  .get(getShoppingLists);

router.get('/upcoming', getUpcomingShopping);

router.route('/lists/:id')
  .get(getShoppingListById)
  .put(updateShoppingList)
  .delete(deleteShoppingList);

router.post('/lists/:id/items', addItemToList);
router.post('/lists/:id/generate-expense', generateExpenseFromList);

router.route('/items/:id')
  .put(updateShoppingItem)
  .delete(deleteShoppingItem);

router.route('/recurring')
  .post(createRecurringItem)
  .get(getRecurringItems);

router.route('/recurring/:id')
  .put(updateRecurringItem)
  .delete(deleteRecurringItem);

module.exports = router;
