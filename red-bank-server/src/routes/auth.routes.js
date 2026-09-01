import express from 'express';
import {
  createAccessToken,
  refreshToken,
  createNewUser,
  logout,
  getUserDetails,
  updateUser,
  updateUserRole,
  updateUserStatus,
} from '../controllers/auth/authController.js';
import { authenticate } from '../middleware/authenticate.js';
import { authenticateFirebase } from '../middleware/authenticateFirebase.js';
import { authorize } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';
import {
  registerSchema,
  updateUserSchema,
  updateRoleSchema,
  updateStatusSchema,
} from '../validations/auth.validation.js';
import { ROLES } from '../utils/constants.js';

const router = express.Router();

router.get('/csrf', (req, res) => {
  res.status(200).json({ success: true, data: { csrfToken: req.csrfToken } });
});
router.post('/create-user', authenticateFirebase, validate(registerSchema), createNewUser);
router.post('/session', authenticateFirebase, createAccessToken);
router.post('/refresh-token', refreshToken);
router.post('/logout', logout);
router.get('/user', authenticate, getUserDetails);
router.patch('/user/update', authenticate, validate(updateUserSchema), updateUser);
router.patch('/user/update/role', authenticate, authorize(ROLES.ADMIN), validate(updateRoleSchema), updateUserRole);
router.patch('/user/update/status', authenticate, authorize(ROLES.ADMIN), validate(updateStatusSchema), updateUserStatus);

export default router;
