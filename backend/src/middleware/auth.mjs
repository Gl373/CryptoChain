import jwt from 'jsonwebtoken';
import { jwtConfig } from '../../config/jwt.mjs';
import AppError from '../utilities/AppError.mjs';

export const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return next(new AppError('No token provided', 401));
  }
  try {
    const decoded = jwt.verify(token, jwtConfig.secret);
    req.user = decoded;
    next();
  } catch (error) {
    next(new AppError('Invalid token', 401));
  }
};

export const protect = authenticate;

export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('Access denied', 403));
    }
    next();
  };
};