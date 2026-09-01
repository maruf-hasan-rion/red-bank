import express from 'express';
import authRoutes from './auth.routes.js';
import donationRoutes from './donation.routes.js';
import blogRoutes from './blog.routes.js';
import adminRoutes from './admin.routes.js';
import paymentRoutes from './payment.routes.js';
import publicRoutes from './public.routes.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/donation', donationRoutes);
router.use('/blog', blogRoutes);
router.use('/dashboard', adminRoutes);
router.use('/payment', paymentRoutes);
router.use('/public', publicRoutes);

export default router;
