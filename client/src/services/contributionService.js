import api from './api';

export const getContribution = (params) => api.get('/contribution', { params });
