import api from './api';

export const createChore = (data) => api.post('/chores', data);

export const getChores = (params = {}) => api.get('/chores', { params });

export const getChoreById = (id) => api.get(`/chores/${id}`);

export const updateChore = (id, data) => api.put(`/chores/${id}`, data);

export const deleteChore = (id) => api.delete(`/chores/${id}`);

export const claimChore = (id) => api.post(`/chores/${id}/claim`);

export const assignChore = (id, userId) => api.post(`/chores/${id}/assign`, { userId });

export const completeChore = (id) => api.post(`/chores/${id}/complete`);

export const getSmartRecommendation = (id) => api.get(`/chores/${id}/recommendation`);

export const assignSmartRecommendation = (id, data) => api.post(`/chores/${id}/assign-smart`, data);

export const getChoreHistory = (params = {}) => api.get('/chores/history', { params });

export const getHouseholdWorkload = () => api.get('/chores/workload');
