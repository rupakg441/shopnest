import jwt from 'jsonwebtoken';

export const generateAccessToken = (userId, role) => {
  if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is required');
  return jwt.sign(
    { userId, role, tokenType: 'access' },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m' }
  );
};

export const generateRefreshToken = (userId) => {
  if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is required');
  return jwt.sign(
    { userId, tokenType: 'refresh' },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d' }
  );
};

export default generateAccessToken;
