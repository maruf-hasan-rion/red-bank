import api from './api';

const donationService = {
  create: (data) => api.post('/donation/create', data),
  getForDonor: (email, limit) => api.get('/donation', { params: { email, limit } }),
  getById: (id) => api.get('/donation/details', { params: { id } }),
  getPaginated: (email, page, limit, status) =>
    api.get('/donation/paginated', { params: { email, page, limit, status } }),
  getDonationsIJoined: (email, page, limit, status) =>
    api.get('/donation/paginated', { params: { donorEmail: email, page, limit, status } }),
  getSingle: (postId) => api.get('/donation/single', { params: { postId } }),
  claim: (id) => api.post('/donation/claim', { id }),
  update: (id, data) => api.patch('/donation/update', data, { params: { id } }),
  delete: (id) => api.delete('/donation/delete', { params: { id } }),
};

export default donationService;
