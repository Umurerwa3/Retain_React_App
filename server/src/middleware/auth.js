import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * Requires a valid "Authorization: Bearer <token>" header and attaches the user to req.user.
 */
export const protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) throw ApiError.unauthorized();

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    throw ApiError.unauthorized('Session expired or invalid, please sign in again');
  }

  const user = await User.findById(payload.id);
  if (!user) throw ApiError.unauthorized('User no longer exists');

  req.user = user;
  next();
});

/**
 * Restricts a route to the given roles. Must run after `protect`.
 */
export const authorize =
  (...roles) =>
  (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(ApiError.forbidden());
    }
    next();
  };
