import api from './api';

export const createHelpRequest = (data) => api.post('/help', data);
export const getHelpRequests = (params) => api.get('/help', { params });
export const getHelpHistory = (params) => api.get('/help/history', { params });
export const getHelpRequestById = (id) => api.get(`/help/${id}`);
export const updateHelpRequest = (id, data) => api.put(`/help/${id}`, data);
export const deleteHelpRequest = (id) => api.delete(`/help/${id}`);
export const acceptHelpRequest = (id) => api.post(`/help/${id}/accept`);
export const startHelpRequest = (id) => api.post(`/help/${id}/start`);
export const completeHelpRequest = (id) => api.post(`/help/${id}/complete`);
export const cancelHelpRequest = (id, reason) => api.post(`/help/${id}/cancel`, { reason });
export const getHelpRecommendations = (id) => api.get(`/help/${id}/recommendations`);
