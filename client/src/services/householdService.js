import api from './api';

export const createHousehold = (data) => api.post('/households', data);
export const getMyHousehold = () => api.get('/households/my');
export const joinHousehold = (data) => api.post('/households/join', data);
export const leaveHousehold = () => api.post('/households/leave');
export const removeMember = (userId) => api.delete(`/households/members/${userId}`);
export const regenerateInviteCode = () => api.post('/households/regenerate-invite');
