import api from './api';

export const createPoll = (data) => api.post('/polls', data);
export const getPolls = (params) => api.get('/polls', { params });
export const getPollById = (id) => api.get(`/polls/${id}`);
export const votePoll = (id, optionIds) => api.post(`/polls/${id}/vote`, { optionIds });
export const closePoll = (id) => api.post(`/polls/${id}/close`);
export const deletePoll = (id) => api.delete(`/polls/${id}`);
