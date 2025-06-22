import jwt from 'jsonwebtoken';
import { jwtConfig } from '../../config/jwt.mjs';
import AppError from '../utilities/AppError.mjs';

export const protect = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return next(new AppError('No token provided', 401));
  try {
    const decoded = jwt.verify(token, jwtConfig.secret);
    req.user = await User.findById(decoded.id);
    next();
  } catch (error) {
    next(new AppError('Invalid token', 401));
  }
};

export const asyncCatch = fn => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};