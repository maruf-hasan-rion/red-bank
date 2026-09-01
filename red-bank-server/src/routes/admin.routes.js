import express from 'express';
import {
  getDashboardOverview,
  getPaginatedUsers,
  getPaginatedDonations,
} from '../controllers/admin/adminController.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { ROLES } from '../utils/constants.js';

const router = express.Router();

router.get('/overview', authenticate, authorize(ROLES.ADMIN), getDashboardOverview);
router.get('/users', authenticate, authorize(ROLES.ADMIN), getPaginatedUsers);
router.get('/donations', authenticate, authorize(ROLES.ADMIN, ROLES.VOLUNTEER), getPaginatedDonations);

export default router;
