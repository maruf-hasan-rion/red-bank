import Stripe from 'stripe';
import mongoose from 'mongoose';
import Fund from '../../models/Fund.js';
import catchAsync from '../../utils/catchAsync.js';
import AppError from '../../utils/AppError.js';
import { sendSuccess } from '../../utils/apiResponse.js';

let stripe;

const getStripe = () => {
  if (!stripe) {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return stripe;
};

export const createPaymentIntent = catchAsync(async (req, res, next) => {
  const { amount, note } = req.body;

  const amountInMinorUnits = Math.round(Number(amount) * 100);

  if (!Number.isFinite(amountInMinorUnits) || amountInMinorUnits <= 0) {
    return next(new AppError('Valid amount is required', 400));
  }

  const paymentIntent = await getStripe().paymentIntents.create({
    amount: amountInMinorUnits,
    currency: 'bdt',
    payment_method_types: ['card'],
    metadata: {
      userId: String(req.user._id),
      customer: req.user.name || 'Anonymous',
      avatar: req.user.avatar || '',
      note: note || '',
    },
  });

  await Fund.create({
    userId: req.user._id,
    name: req.user.name || 'Anonymous',
    avatar: req.user.avatar || '',
    note: note || '',
    amountMinor: amountInMinorUnits,
    currency: 'bdt',
    status: 'pending',
    paymentIntentId: paymentIntent.id,
  });

  sendSuccess(
    res,
    {
      clientSecret: paymentIntent.client_secret,
      id: paymentIntent.id,
    },
    200,
    'Payment intent created successfully'
  );
});

export const handleStripeWebhook = catchAsync(async (req, res) => {
  const signature = req.headers['stripe-signature'];
  let event;

  try {
    event = getStripe().webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch {
    return res.status(400).json({
      success: false,
      message: 'Webhook signature verification failed',
    });
  }

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    if (paymentIntent.currency !== 'bdt') {
      return res.status(200).json({ received: true });
    }
    const { customer, avatar, note, userId } = paymentIntent.metadata || {};

    if (!userId || !mongoose.isValidObjectId(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Payment metadata is invalid',
      });
    }

    await Fund.findOneAndUpdate(
      { paymentIntentId: paymentIntent.id },
      {
        userId,
        name: customer || 'Anonymous',
        avatar: avatar || '',
        note: note || '',
        amountMinor: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: 'succeeded',
        paymentIntentId: paymentIntent.id,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }

  res.status(200).json({ received: true });
});
