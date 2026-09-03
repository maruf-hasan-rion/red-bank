import crypto from 'crypto';
import AppError from '../utils/AppError.js';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);
const CSRF_COOKIE = 'csrfToken';

const getAllowedOrigins = () =>
  String(process.env.ORIGIN || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

export const csrfProtection = (req, res, next) => {
  const existingToken = req.cookies[CSRF_COOKIE];
  const token = existingToken || crypto.randomBytes(32).toString('hex');

  if (!existingToken) {
    res.cookie(CSRF_COOKIE, token, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
      maxAge: 24 * 60 * 60 * 1000,
    });
  }

  req.csrfToken = token;

  if (SAFE_METHODS.has(req.method)) {
    return next();
  }

  if (existingToken) {
    const requestToken = req.get('x-csrf-token');
    const tokensMatch =
      requestToken &&
      requestToken.length === token.length &&
      crypto.timingSafeEqual(Buffer.from(requestToken), Buffer.from(token));

    if (!tokensMatch) {
      return next(new AppError('Invalid CSRF token', 403));
    }
  } else {
    const requestOrigin = req.get('origin');
    const originAllowed =
      requestOrigin &&
      getAllowedOrigins().some(
        (origin) => origin.toLowerCase() === requestOrigin.toLowerCase()
      );

    if (!originAllowed) {
      return next(new AppError('Invalid CSRF token', 403));
    }
  }

  return next();
};