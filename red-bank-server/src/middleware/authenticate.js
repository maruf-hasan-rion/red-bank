import jwt from 'jsonwebtoken';
import AppError from '../utils/AppError.js';
import User from '../models/User.js';
import { STATUS } from '../utils/constants.js';

export const authenticate = async (req, res, next) => {
  const { accessToken } = req.cookies;

  if (!accessToken) {
    return next(new AppError('Unauthorized access', 401));
  }

  let decoded;
  try {
    decoded = jwt.verify(accessToken, process.env.JWT_SECRET);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return next(new AppError('Token expired', 401));
    }
    return next(new AppError('Invalid token', 401));
  }

  const user = await User.findOne({ uid: decoded.uid });

  if (!user) {
    return next(new AppError('User not found', 401));
  }

  if (user.status !== STATUS.ACTIVE) {
    return next(new AppError('Your account is blocked', 403));
  }

  req.user = user;
  req.uid = user.uid;
  next();
};
