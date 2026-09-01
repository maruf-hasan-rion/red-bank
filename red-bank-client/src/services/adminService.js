import api from './api';

const adminService = {
  getOverview: () => api.get('/dashboard/overview'),
  getPaginatedUsers: (page, limit, search, status) =>
    api.get('/dashboard/users', {
      params: { page, limit, search: search || undefined, status: status || undefined },
    }),
  getPaginatedDonations: (page, limit, status) =>
    api.get('/dashboard/donations', {
      params: { page, limit, status: status || undefined },
    }),
  updateUserRole: (id, role) =>
    api.patch('/auth/user/update/role', { role }, { params: { id } }),
  updateUserStatus: (id, status) =>
    api.patch('/auth/user/update/status', { status }, { params: { id } }),
};

export default adminService;
