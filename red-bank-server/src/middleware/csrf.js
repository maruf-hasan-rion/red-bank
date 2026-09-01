import crypto from 'crypto';
import AppError from '../utils/AppError.js';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);
const CSRF_COOKIE = 'csrfToken';

export const csrfProtection = (req, res, next) => {
  let token = req.cookies[CSRF_COOKIE];

  if (!token) {
    token = crypto.randomBytes(32).toString('hex');
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

  const requestToken = req.get('x-csrf-token');
  const tokensMatch =
    requestToken &&
    requestToken.length === token.length &&
    crypto.timingSafeEqual(Buffer.from(requestToken), Buffer.from(token));

  if (!tokensMatch) {
    return next(new AppError('Invalid CSRF token', 403));
  }

  return next();
};
