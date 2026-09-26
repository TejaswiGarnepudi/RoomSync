import api from './api';

export const createAvailability = (data) => api.post('/availability', data);

export const getMyAvailability = (params = {}) => api.get('/availability/my', { params });

export const getHouseholdAvailability = (params = {}) => api.get('/availability/household', { params });

export const getCommonAvailability = (params = {}) => api.get('/availability/household/common', { params });

export const updateAvailability = (id, data) => api.put(`/availability/${id}`, data);

export const deleteAvailability = (id) => api.delete(`/availability/${id}`);
