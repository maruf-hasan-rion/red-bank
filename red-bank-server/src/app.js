import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';

import { connectDatabase } from './config/database.js';
import { validateEnv } from './config/env.js';
import routes from './routes/index.js';
import { handleStripeWebhook } from './controllers/payment/stripeController.js';
import { validateOrigin } from './middleware/validateOrigin.js';
import AppError from './utils/AppError.js';
import globalErrorHandler from './middleware/errorHandler.js';
import { csrfProtection } from './middleware/csrf.js';

dotenv.config();

validateEnv();

const app = express();
app.set('trust proxy', 1);

app.use(helmet());
app.use(compression());
app.use(morgan('combined'));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.path === '/payment/webhooks/stripe',
});
app.use('/api', limiter);

app.use('/api/auth', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many authentication attempts, please try again later.' },
}));

const allowedOrigins = (process.env.ORIGIN || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.get('/health', (req, res) => {
  const databaseReady = mongoose.connection.readyState === 1;
  res.status(databaseReady ? 200 : 503).json({
    success: databaseReady,
    message: databaseReady ? 'OK' : 'Database unavailable',
    data: { database: databaseReady ? 'connected' : 'disconnected' },
  });
});

// Stripe webhook needs raw body for signature verification
app.post(
  '/api/payment/webhooks/stripe',
  express.raw({ type: 'application/json' }),
  async (req, res, next) => {
    try {
      await connectDatabase();
      return handleStripeWebhook(req, res, next);
    } catch (error) {
      return next(error);
    }
  }
);

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser());
app.use(csrfProtection);

app.use(validateOrigin);

app.use('/api', async (req, res, next) => {
  try {
    await connectDatabase();
    return next();
  } catch (error) {
    return next(error);
  }
});

app.use('/api', routes);

app.all('*', (req, res, next) => {
  next(new AppError(`Cannot find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);

export default app;
