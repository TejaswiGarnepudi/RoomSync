import api from './api';

export const createShoppingList = (data) => api.post('/shopping/lists', data);

export const getShoppingLists = (params = {}) => api.get('/shopping/lists', { params });

export const getShoppingListById = (id) => api.get(`/shopping/lists/${id}`);

export const updateShoppingList = (id, data) => api.put(`/shopping/lists/${id}`, data);

export const deleteShoppingList = (id) => api.delete(`/shopping/lists/${id}`);

export const addItemToList = (listId, data) => api.post(`/shopping/lists/${listId}/items`, data);

export const updateShoppingItem = (itemId, data) => api.put(`/shopping/items/${itemId}`, data);

export const deleteShoppingItem = (itemId) => api.delete(`/shopping/items/${itemId}`);

export const createRecurringItem = (data) => api.post('/shopping/recurring', data);

export const getRecurringItems = () => api.get('/shopping/recurring');

export const updateRecurringItem = (id, data) => api.put(`/shopping/recurring/${id}`, data);

export const deleteRecurringItem = (id) => api.delete(`/shopping/recurring/${id}`);

export const getUpcomingShopping = () => api.get('/shopping/upcoming');

export const generateExpenseFromList = (listId, data = {}) => api.post(`/shopping/lists/${listId}/generate-expense`, data);
