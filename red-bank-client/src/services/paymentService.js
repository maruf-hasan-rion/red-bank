import api from './api';

const paymentService = {
  createPaymentIntent: (data) => api.post('/payment/create-intent', data),
};

export default paymentService;
