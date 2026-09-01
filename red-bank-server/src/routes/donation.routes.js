import express from 'express';
import {
  createDonation,
  getDonationsForDonor,
  getDonationDetails,
  deleteDonation,
  updateDonation,
  claimDonation,
  getPaginatedDonations,
  getSingleDonation,
} from '../controllers/blood-donation/donationController.js';
import { authenticate } from '../middleware/authenticate.js';
import { validate } from '../middleware/validate.js';
import {
  createDonationSchema,
  updateDonationSchema,
  claimDonationSchema,
} from '../validations/donation.validation.js';

const router = express.Router();

router.post('/create', authenticate, validate(createDonationSchema), createDonation);
router.post('/claim', authenticate, validate(claimDonationSchema), claimDonation);
router.get('/', authenticate, getDonationsForDonor);
router.get('/details', authenticate, getDonationDetails);
router.get('/paginated', authenticate, getPaginatedDonations);
router.get('/single', authenticate, getSingleDonation);
router.delete('/delete', authenticate, deleteDonation);
router.patch('/update', authenticate, validate(updateDonationSchema), updateDonation);

export default router;
