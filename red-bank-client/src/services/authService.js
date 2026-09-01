import api from './api';

const authService = {
  createSession: () => api.post('/auth/session'),
  createUser: (data) => api.post('/auth/create-user', data),
  getUser: () => api.get('/auth/user'),
  updateUser: (data) => api.patch('/auth/user/update', data),
  logout: () => api.post('/auth/logout'),
};

export default authService;
