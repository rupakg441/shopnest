import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { registerValidator, loginValidator } from '../validators/authValidator.js';

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res, next) => {
  try {
    // Validate request body
    const validatedData = registerValidator.parse(req.body);

    const { firstName, lastName, email, password } = validatedData;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return sendError(res, 'User already exists', ['A user with this email address already exists.'], 409);
    }

    // Create user
    const user = await User.create({
      firstName,
      lastName,
      email,
      password
    });

    if (user) {
      const token = generateToken(user._id, user.role);

      return sendSuccess(res, 'Registration successful', {
        token,
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          name: user.name,
          email: user.email,
          role: user.role,
          tier: user.tier,
          avatar: user.avatar
        }
      }, 201);
    } else {
      return sendError(res, 'Invalid user data', ['Failed to create user.'], 400);
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res, next) => {
  try {
    console.log("[LOGIN] 1. Parsing credentials...");
    const validatedData = loginValidator.parse(req.body);
    const { email, password } = validatedData;

    console.log("[LOGIN] 2. Querying user in DB for email:", email);
    // Check for user
    const user = await User.findOne({ email }).select('+password');
    console.log("[LOGIN] 3. Query finished. User found:", user ? "YES" : "NO");

    if (!user) {
      console.log("[LOGIN] 3a. User not found, sending 401");
      return sendError(res, 'Invalid credentials', ['Invalid email or password.'], 401);
    }

    console.log("[LOGIN] 4. Matching password...");
    // Check password
    const isMatch = await user.matchPassword(password);
    console.log("[LOGIN] 5. Password match status:", isMatch);

    if (!isMatch) {
      console.log("[LOGIN] 5a. Password mismatch, sending 401");
      return sendError(res, 'Invalid credentials', ['Invalid email or password.'], 401);
    }

    console.log("[LOGIN] 6. Generating JWT token...");
    const token = generateToken(user._id, user.role);
    console.log("[LOGIN] 7. Token generated successfully");

    return sendSuccess(res, 'Login successful', {
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        name: user.name,
        email: user.email,
        role: user.role,
        tier: user.tier,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.log("[LOGIN] ERROR caught:", error);
    next(error);
  }
};

// @desc    Get current logged in user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res, next) => {
  try {
    const user = req.user;
    return sendSuccess(res, 'User profile retrieved', {
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        name: user.name,
        email: user.email,
        role: user.role,
        tier: user.tier,
        avatar: user.avatar
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Log user out
// @route   POST /api/auth/logout
// @access  Private
export const logoutUser = async (req, res, next) => {
  try {
    // In stateless JWT auth, clients discard tokens. We return a successful response.
    return sendSuccess(res, 'Logout successful', {});
  } catch (error) {
    next(error);
  }
};
