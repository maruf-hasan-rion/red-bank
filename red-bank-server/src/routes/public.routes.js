import express from 'express';
import { getAllDonors } from '../controllers/public/donorController.js';
import { subscribe } from '../controllers/public/subscribeController.js';
import { getPublicDonations } from '../controllers/public/donationController.js';
import { getPublicStats } from '../controllers/public/statsController.js';
import { createContactMessage } from '../controllers/public/contactController.js';
import { validate } from '../middleware/validate.js';
import { contactSchema } from '../validations/contact.validation.js';
import { donorSearchSchema, subscribeSchema } from '../validations/public.validation.js';

const router = express.Router();

router.post('/donors', validate(donorSearchSchema), getAllDonors);
router.post('/subscribe', validate(subscribeSchema), subscribe);
router.post('/contact', validate(contactSchema), createContactMessage);
router.get('/donations', getPublicDonations);
router.get('/status', getPublicStats);

export default router;
