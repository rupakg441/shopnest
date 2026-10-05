import { createHash } from 'node:crypto';

export const REFRESH_COOKIE = 'shopnest_refresh';

export const hashToken = (token) => createHash('sha256').update(token).digest('hex');

const cookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/api/auth',
});

export const setRefreshCookie = (res, token, remember = false) => {
  const options = {
    ...cookieOptions(),
  };
  if (remember) options.maxAge = 30 * 24 * 60 * 60 * 1000;
  res.cookie(REFRESH_COOKIE, token, options);
};

export const clearRefreshCookie = (res) => {
  res.clearCookie(REFRESH_COOKIE, cookieOptions());
};

export const getCookie = (req, name) => {
  const prefix = `${name}=`;
  const value = (req.headers.cookie || '').split(';').map((part) => part.trim())
    .find((part) => part.startsWith(prefix));
  return value ? decodeURIComponent(value.slice(prefix.length)) : null;
};
