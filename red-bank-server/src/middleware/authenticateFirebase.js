import AppError from '../utils/AppError.js';
import { verifyFirebaseIdToken } from '../config/firebaseAdmin.js';

export const authenticateFirebase = async (req, res, next) => {
  const authorization = req.get('authorization');

  if (!authorization?.startsWith('Bearer ')) {
    return next(new AppError('Firebase authentication is required', 401));
  }

  try {
    const token = authorization.slice('Bearer '.length).trim();
    if (!token) {
      return next(new AppError('Firebase authentication is required', 401));
    }

    req.firebaseUser = await verifyFirebaseIdToken(token);
    return next();
  } catch {
    return next(new AppError('Invalid Firebase authentication', 401));
  }
};
