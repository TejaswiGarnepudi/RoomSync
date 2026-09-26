import api from './api';

export const createExpense = (data) => api.post('/expenses', data);

export const getExpenses = (params = {}) => api.get('/expenses', { params });

export const getExpenseById = (id) => api.get(`/expenses/${id}`);

export const updateExpense = (id, data) => api.put(`/expenses/${id}`, data);

export const deleteExpense = (id) => api.delete(`/expenses/${id}`);

export const recordPayment = (id, data = {}) => api.post(`/expenses/${id}/pay`, data);

export const getHouseholdBalances = () => api.get('/expenses/balances');

export const getSimplifiedSettlements = () => api.get('/expenses/settlements');
