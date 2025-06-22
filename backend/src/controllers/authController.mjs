import dotenv from 'dotenv';
dotenv.config({ path: './backend/config/config.env' });
import { asyncCatch } from '../middleware/asyncCatch.mjs';
import { User } from '../models/User.mjs';
import jwt from 'jsonwebtoken';
import { jwtConfig } from '../../config/jwt.mjs';
import AppError from '../utilities/AppError.mjs';
import Wallet from '../models/Wallet.mjs';

export const register = asyncCatch(async (req, res, next) => {
  console.log('REGISTER BODY:', req.body);
  const { username, password } = req.body;
  const wallet = new Wallet();
  const user = await User.create({ username, password, publicKey: wallet.publicKey });
  console.log('USER CREATED:', user);
  res.status(201).json({ success: true, data: { username, role: user.role, publicKey: user.publicKey } });
});

export const login = asyncCatch(async (req, res, next) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user || !(await user.comparePassword(password))) {
    return next(new AppError('Invalid credentials', 401));
  }
  console.log('jwtConfig.secret:', jwtConfig.secret);
  const token = jwt.sign({ username, role: user.role }, jwtConfig.secret, {
    expiresIn: jwtConfig.expiresIn
  });
  res.status(200).json({ success: true, data: { token } });
});