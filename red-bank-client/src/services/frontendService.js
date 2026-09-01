import api from './api';

const frontendService = {
  getAllDonors: (data) => api.post('/public/donors', data),
  getAllFunds: (page, limit) => api.get('/payment/funds', { params: { page, limit } }),
  subscribe: (email) => api.post('/public/subscribe', { email }),
  sendContactMessage: (data) => api.post('/public/contact', data),
  getAllStatus: () => api.get('/public/status'),
  getPublicDonations: (page, limit) =>
    api.get('/public/donations', { params: { page, limit } }),
};

export default frontendService;
