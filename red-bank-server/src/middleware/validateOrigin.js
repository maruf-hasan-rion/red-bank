import AppError from '../utils/AppError.js';

const getAllowedOrigins = () =>
  String(process.env.ORIGIN || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

export const validateOrigin = (req, res, next) => {
  try {
    const requestOrigin = req.headers.origin;

    if (!requestOrigin) {
      return next();
    }

    const allowedOrigins = getAllowedOrigins();

    if (
      allowedOrigins.length > 0 &&
      allowedOrigins.some(
        (origin) => origin.toLowerCase() === requestOrigin.toLowerCase()
      )
    ) {
      return next();
    }

    return next(new AppError('Unauthorized request', 403));
  } catch {
    return next(new AppError('Invalid request origin configuration', 500));
  }
};