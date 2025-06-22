import { User } from '../models/User.mjs';
import { asyncCatch } from '../middleware/asyncCatch.mjs';

export const listUsers = asyncCatch(async (req, res, next) => {
  const users = await User.find({}, 'username publicKey');
  res.status(200).json({ success: true, data: users });
}); 