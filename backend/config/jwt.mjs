import dotenv from 'dotenv';
dotenv.config({ path: './backend/config/config.env' });

export const jwtConfig = {
    secret: process.env.JWT_SECRET,
    expiresIn: '1h'
  };