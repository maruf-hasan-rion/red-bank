import Subscribe from '../../models/Subscribe.js';
import catchAsync from '../../utils/catchAsync.js';
import AppError from '../../utils/AppError.js';
import { sendSuccess } from '../../utils/apiResponse.js';

export const subscribe = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  const existingSubscription = await Subscribe.findOne({ email });

  if (existingSubscription) {
    return next(new AppError('Email already subscribed', 409));
  }

  await Subscribe.create({ email });

  sendSuccess(res, null, 201, 'Subscribed successfully');
});
