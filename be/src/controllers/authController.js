import jwt from 'jsonwebtoken';
import { randomBytes } from 'node:crypto';
import User from '../models/User.js';
import { generateAccessToken, generateRefreshToken } from '../utils/generateToken.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import {
  emailValidator,
  loginValidator,
  registerValidator,
  resetPasswordValidator,
} from '../validators/authValidator.js';
import { sendAccountEmail } from '../services/mailService.js';
import {
  clearRefreshCookie,
  getCookie,
  hashToken,
  REFRESH_COOKIE,
  setRefreshCookie,
} from '../utils/authSession.js';

const publicUser = (user) => ({
  id: user._id,
  firstName: user.firstName,
  lastName: user.lastName,
  name: user.name,
  email: user.email,
  role: user.role === 'user' ? 'customer' : user.role,
  tier: user.tier,
  avatar: user.avatar,
});

const issueSession = async (user, res, remember = false) => {
  const accessToken = generateAccessToken(user._id, user.role);
  const refreshToken = generateRefreshToken(user._id);
  const decodedRefresh = jwt.decode(refreshToken);

  user.refreshTokenHash = hashToken(refreshToken);
  user.refreshTokenExpiresAt = new Date(decodedRefresh.exp * 1000);
  user.rememberSession = remember;
  await user.save({ validateBeforeSave: false });
  setRefreshCookie(res, refreshToken, remember);

  return { token: accessToken, user: publicUser(user) };
};

export const registerUser = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password } = registerValidator.parse(req.body);
    const requiresVerification = process.env.EMAIL_VERIFICATION_REQUIRED !== 'false';
    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      role: 'customer',
      emailVerified: !requiresVerification,
    });
    if (requiresVerification) {
      const token = randomBytes(32).toString('hex');
      user.emailVerificationTokenHash = hashToken(token);
      user.emailVerificationExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
      await user.save({ validateBeforeSave: false });
      const actionUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/verify-email?token=${token}`;
      await sendAccountEmail({
        to: user.email,
        subject: 'Verify your ShopNest account',
        text: 'Verify your email address to finish creating your ShopNest account.',
        actionUrl,
      });
      return sendSuccess(res, 'Check your email to verify your account.', {
        verificationRequired: true,
        email: user.email,
      }, 201);
    }

    const session = await issueSession(user, res, true);
    return sendSuccess(res, 'Registration successful', session, 201);
  } catch (error) {
    next(error);
  }
};

const authenticate = async (req, res, next, adminsOnly = false) => {
  try {
    const { email, password, remember } = loginValidator.parse(req.body);
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      return sendError(res, 'Invalid credentials', ['Invalid email or password.'], 401);
    }
    if (!user.isActive) {
      return sendError(res, 'Account unavailable', ['This account is currently unavailable.'], 403);
    }
    if (process.env.EMAIL_VERIFICATION_REQUIRED !== 'false' && !user.emailVerified) {
      return sendError(res, 'Email verification required', ['Verify your email before signing in.'], 403);
    }
    const isAdmin = ['admin', 'superadmin'].includes(user.role);
    if (adminsOnly && !isAdmin) {
      return sendError(res, 'Invalid credentials', ['Invalid email or password.'], 401);
    }
    const session = await issueSession(user, res, remember);
    return sendSuccess(res, 'Login successful', session);
  } catch (error) {
    next(error);
  }
};

export const loginUser = (req, res, next) => authenticate(req, res, next);
export const loginAdmin = (req, res, next) => authenticate(req, res, next, true);

export const refreshSession = async (req, res, next) => {
  try {
    const refreshToken = getCookie(req, REFRESH_COOKIE);
    if (!refreshToken) {
      clearRefreshCookie(res);
      return sendError(res, 'Authentication required', ['Refresh session is missing.'], 401);
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    if (decoded.tokenType !== 'refresh') {
      clearRefreshCookie(res);
      return sendError(res, 'Authentication required', ['Refresh session is invalid.'], 401);
    }
    const user = await User.findById(decoded.userId)
      .select('+refreshTokenHash +refreshTokenExpiresAt +rememberSession');
    if (!user || !user.isActive || !user.refreshTokenHash ||
        user.refreshTokenHash !== hashToken(refreshToken) ||
        user.refreshTokenExpiresAt <= new Date()) {
      clearRefreshCookie(res);
      return sendError(res, 'Authentication required', ['Refresh session is invalid or expired.'], 401);
    }

    const session = await issueSession(user, res, user.rememberSession);
    return sendSuccess(res, 'Session refreshed', session);
  } catch (error) {
    clearRefreshCookie(res);
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return sendError(res, 'Authentication required', ['Refresh session is invalid or expired.'], 401);
    }
    next(error);
  }
};

export const getMe = async (req, res) => {
  return sendSuccess(res, 'User profile retrieved', { user: publicUser(req.user) });
};

export const verifyEmail = async (req, res, next) => {
  try {
    const token = req.body.token;
    if (typeof token !== 'string' || token.length < 32) {
      return sendError(res, 'Invalid verification link', ['The verification link is invalid or expired.'], 400);
    }
    const user = await User.findOne({
      emailVerificationTokenHash: hashToken(token),
      emailVerificationExpiresAt: { $gt: new Date() },
    }).select('+emailVerificationTokenHash +emailVerificationExpiresAt');
    if (!user) {
      return sendError(res, 'Invalid verification link', ['The verification link is invalid or expired.'], 400);
    }
    user.emailVerified = true;
    user.emailVerificationTokenHash = undefined;
    user.emailVerificationExpiresAt = undefined;
    await user.save({ validateBeforeSave: false });
    return sendSuccess(res, 'Email verified. You can now sign in.', {});
  } catch (error) {
    next(error);
  }
};

export const resendVerification = async (req, res, next) => {
  try {
    const { email } = emailValidator.parse(req.body);
    const user = await User.findOne({ email }).select('+emailVerificationTokenHash +emailVerificationExpiresAt');
    if (user && !user.emailVerified && user.isActive) {
      const token = randomBytes(32).toString('hex');
      user.emailVerificationTokenHash = hashToken(token);
      user.emailVerificationExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
      await user.save({ validateBeforeSave: false });
      const actionUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/verify-email?token=${token}`;
      await sendAccountEmail({ to: user.email, subject: 'Verify your ShopNest account', text: 'Verify your email address to access your ShopNest account.', actionUrl });
    }
    return sendSuccess(res, 'If the account needs verification, a new email has been sent.', {});
  } catch (error) {
    next(error);
  }
};

export const requestPasswordReset = async (req, res, next) => {
  try {
    const { email } = emailValidator.parse(req.body);
    const user = await User.findOne({ email }).select('+passwordResetTokenHash +passwordResetExpiresAt');
    if (user && user.isActive) {
      const token = randomBytes(32).toString('hex');
      user.passwordResetTokenHash = hashToken(token);
      user.passwordResetExpiresAt = new Date(Date.now() + 30 * 60 * 1000);
      await user.save({ validateBeforeSave: false });
      const actionUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password?token=${token}`;
      await sendAccountEmail({ to: user.email, subject: 'Reset your ShopNest password', text: 'Use this one-time link to reset your ShopNest password. It expires in 30 minutes.', actionUrl });
    }
    return sendSuccess(res, 'If an account exists for that email, password reset instructions have been sent.', {});
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = resetPasswordValidator.parse(req.body);
    const user = await User.findOne({
      passwordResetTokenHash: hashToken(token),
      passwordResetExpiresAt: { $gt: new Date() },
    }).select('+password +passwordResetTokenHash +passwordResetExpiresAt +refreshTokenHash +refreshTokenExpiresAt +rememberSession');
    if (!user || !user.isActive) {
      return sendError(res, 'Invalid reset link', ['The password reset link is invalid or expired.'], 400);
    }
    user.password = password;
    user.passwordResetTokenHash = undefined;
    user.passwordResetExpiresAt = undefined;
    user.refreshTokenHash = undefined;
    user.refreshTokenExpiresAt = undefined;
    user.rememberSession = undefined;
    await user.save();
    return sendSuccess(res, 'Password updated. Sign in with your new password.', {});
  } catch (error) {
    next(error);
  }
};

export const logoutUser = async (req, res, next) => {
  try {
    const refreshToken = getCookie(req, REFRESH_COOKIE);
    if (refreshToken) {
      try {
        const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
        if (decoded.tokenType === 'refresh') {
          await User.findByIdAndUpdate(decoded.userId, {
            $unset: { refreshTokenHash: 1, refreshTokenExpiresAt: 1, rememberSession: 1 },
          });
        }
      } catch {
        // Clear an expired or invalid cookie as part of logout too.
      }
    }
    clearRefreshCookie(res);
    return sendSuccess(res, 'Logout successful', {});
  } catch (error) {
    next(error);
  }
};
