import AppError from '../utils/AppError.js';

const requiredEnvVars = [
  'NODE_ENV',
  'MONGO_DB_URI',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
  'ORIGIN',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'FIREBASE_PROJECT_ID',
  'FIREBASE_CLIENT_EMAIL',
  'FIREBASE_PRIVATE_KEY',
];

export const validateEnv = () => {
  const missing = requiredEnvVars.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new AppError(
      `Missing required environment variables: ${missing.join(', ')}`,
      500
    );
  }

  if (
    process.env.PORT !== undefined &&
    (!Number.isInteger(Number(process.env.PORT)) || Number(process.env.PORT) <= 0)
  ) {
    throw new AppError('PORT must be a positive integer', 500);
  }

  const origins = process.env.ORIGIN.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  const hasInvalidOrigin = origins.some((origin) => {
    try {
      new URL(origin);
      return false;
    } catch {
      return true;
    }
  });

  if (origins.length === 0 || hasInvalidOrigin) {
    throw new AppError('ORIGIN must contain at least one valid URL', 500);
  }
};
