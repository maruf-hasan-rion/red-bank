import express from 'express';
import {
  createPaymentIntent,
} from '../controllers/payment/stripeController.js';
import { getAllFunds } from '../controllers/payment/fundController.js';
import { authenticate } from '../middleware/authenticate.js';
import { validate } from '../middleware/validate.js';
import { paymentIntentSchema } from '../validations/payment.validation.js';

const router = express.Router();

router.post('/create-intent', authenticate, validate(paymentIntentSchema), createPaymentIntent);
router.get('/funds', authenticate, getAllFunds);

export default router;
