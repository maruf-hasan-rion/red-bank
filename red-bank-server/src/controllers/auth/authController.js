import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../../models/User.js';
import catchAsync from '../../utils/catchAsync.js';
import AppError from '../../utils/AppError.js';
import { sendSuccess } from '../../utils/apiResponse.js';
import { toPublicUser } from '../../utils/user.js';
import { ROLES, STATUS } from '../../utils/constants.js';

const hashToken = (token) =>
  crypto.createHash('sha256').update(token).digest('hex');

const cookieOptions = (maxAge) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
  maxAge,
  path: '/',
});

const issueSession = async (user, res) => {
  const accessToken = jwt.sign({ uid: user.uid }, process.env.JWT_SECRET, {
    expiresIn: '15m',
  });
  const refreshToken = jwt.sign(
    { uid: user.uid },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );

  await User.findByIdAndUpdate(user._id, {
    $set: { refreshTokenHash: hashToken(refreshToken) },
  });

  res.cookie('accessToken', accessToken, cookieOptions(15 * 60 * 1000));
  res.cookie(
    'refreshToken',
    refreshToken,
    cookieOptions(7 * 24 * 60 * 60 * 1000)
  );
};

export const createAccessToken = catchAsync(async (req, res, next) => {
  const uid = req.firebaseUser?.uid;
  const user = await User.findOne({ uid });

  if (!user) {
    return next(new AppError('User profile not found', 404));
  }

  if (user.status !== STATUS.ACTIVE) {
    return next(new AppError('Your account is blocked', 403));
  }

  await issueSession(user, res);

  sendSuccess(res, null, 200, 'Tokens created successfully');
});

export const refreshToken = catchAsync(async (req, res, next) => {
  const { refreshToken: token } = req.cookies;

  if (!token) {
    return next(new AppError('Refresh token not found', 401));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const user = await User.findOne({ uid: decoded.uid }).select(
      '+refreshTokenHash'
    );

    const incomingHash = hashToken(token);
    const storedHash = user?.refreshTokenHash;
    const tokensMatch =
      storedHash &&
      storedHash.length === incomingHash.length &&
      crypto.timingSafeEqual(
        Buffer.from(storedHash),
        Buffer.from(incomingHash)
      );

    if (!user || user.status !== STATUS.ACTIVE || !tokensMatch) {
      return next(new AppError('Invalid refresh token', 401));
    }

    await issueSession(user, res);

    sendSuccess(res, null, 200, 'Tokens refreshed successfully');
  } catch (error) {
    if (error.name === 'TokenExpiredError' || error.name === 'JsonWebTokenError') {
      return next(new AppError('Invalid refresh token', 401));
    }
    return next(error);
  }
});

export const createNewUser = catchAsync(async (req, res, next) => {
  const { name, avatar, bloodGroup, district, upazila } = req.body;
  const { email, uid } = req.firebaseUser || {};

  if (!email || !uid) {
    return next(new AppError('Verified Firebase identity is required', 401));
  }

  const existingUser = await User.findOne({ $or: [{ email }, { uid }] });

  if (existingUser) {
    return next(new AppError('User already exists', 409));
  }

  const user = await User.create({
    email,
    uid,
    name,
    avatar,
    bloodGroup,
    district,
    upazila,
  });

  await issueSession(user, res);
  sendSuccess(res, toPublicUser(user), 201, 'User registered successfully');
});

export const logout = catchAsync(async (req, res) => {
  const { refreshToken: token } = req.cookies;

  if (token) {
    await User.findOneAndUpdate(
      { refreshTokenHash: hashToken(token) },
      { $set: { refreshTokenHash: null } }
    );
  }

  res
    .clearCookie('accessToken', cookieOptions(0))
    .clearCookie('refreshToken', cookieOptions(0));

  sendSuccess(res, null, 200, 'Logged out successfully');
});

export const getUserDetails = catchAsync(async (req, res) => {
  sendSuccess(res, toPublicUser(req.user), 200, 'User retrieved successfully');
});

export const updateUser = catchAsync(async (req, res, next) => {
  const { name, avatar, bloodGroup, district, upazila } = req.body;

  const updates = Object.fromEntries(
    Object.entries({ name, avatar, bloodGroup, district, upazila }).filter(
      ([, value]) => value !== undefined
    )
  );

  if (Object.keys(updates).length === 0) {
    return next(new AppError('At least one profile field is required', 400));
  }

  const user = await User.findOneAndUpdate(
    { uid: req.uid },
    { $set: updates },
    { new: true, runValidators: true }
  );

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  sendSuccess(res, toPublicUser(user), 200, 'Profile updated successfully');
});

export const updateUserRole = catchAsync(async (req, res, next) => {
  const { id } = req.query;
  const { role } = req.body;

  if (!id || !role) {
    return next(new AppError('ID and role are required', 400));
  }

  if (!mongoose.isValidObjectId(id)) {
    return next(new AppError('Valid user ID is required', 400));
  }

  if (req.user.role !== ROLES.ADMIN) {
    return next(new AppError('Unauthorized', 403));
  }

  if (String(req.user._id) === id) {
    return next(new AppError('Administrators cannot change their own role', 400));
  }

  const user = await User.findByIdAndUpdate(
    id,
    { $set: { role } },
    { new: true, runValidators: true }
  );

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  sendSuccess(res, null, 200, 'Role updated successfully');
});

export const updateUserStatus = catchAsync(async (req, res, next) => {
  const { id } = req.query;
  const { status } = req.body;

  if (!id || !status) {
    return next(new AppError('ID and status are required', 400));
  }

  if (!mongoose.isValidObjectId(id)) {
    return next(new AppError('Valid user ID is required', 400));
  }

  if (req.user.role !== ROLES.ADMIN) {
    return next(new AppError('Unauthorized', 403));
  }

  if (String(req.user._id) === id) {
    return next(new AppError('Administrators cannot change their own status', 400));
  }

  const statusUpdate = { status };
  if (status === STATUS.BLOCKED) {
    statusUpdate.refreshTokenHash = null;
  }

  const user = await User.findByIdAndUpdate(
    id,
    { $set: statusUpdate },
    { new: true, runValidators: true }
  );

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  sendSuccess(res, null, 200, 'Status updated successfully');
});
