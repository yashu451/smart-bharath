const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../.env') });
dotenv.config();

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');
const { memoryUsers, saveToDisk } = require('../config/memoryStore');

const isDbConnected = () => mongoose.connection.readyState === 1;

const generateToken = (userOrId, extra = {}) => {
  let userId = userOrId;
  let userDetails = extra;

  if (typeof userOrId === 'object' && userOrId !== null) {
    userId = userOrId._id ? userOrId._id.toString() : userOrId.id;
    userDetails = userOrId;
  }

  const cleanId = (userId || '').toString();

  return jwt.sign(
    {
      id: cleanId,
      _id: cleanId,
      userId: cleanId,
      name: userDetails.name || 'Citizen',
      email: userDetails.email || '',
      mobile: userDetails.mobile || '',
      isAadhaarVerified: !!userDetails.isAadhaarVerified,
    },
    process.env.JWT_SECRET || 'smart-bharat-jwt-secret-key-2026',
    { expiresIn: '7d' }
  );
};

// @desc    Register new citizen
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { name, email, mobile, password, pin, aadhaar } = req.body;

    if (!name || !email || !mobile || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, email, mobile, password.',
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanMobile = mobile.trim();

    // Check existing user
    let existingUser = null;
    if (isDbConnected()) {
      existingUser = await User.findOne({
        $or: [{ email: cleanEmail }, { mobile: cleanMobile }],
      });
    } else {
      existingUser = memoryUsers.find(
        (u) => u.email === cleanEmail || u.mobile === cleanMobile
      );
    }

    if (existingUser) {
      const field = existingUser.email === cleanEmail ? 'Email' : 'Mobile number';
      return res.status(400).json({
        success: false,
        message: `${field} is already registered. Please login.`,
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Hash PIN if provided
    let hashedPin = undefined;
    if (pin) {
      hashedPin = await bcrypt.hash(pin.toString(), salt);
    }

    let user = null;
    if (isDbConnected()) {
      user = await User.create({
        name: name.trim(),
        email: cleanEmail,
        mobile: cleanMobile,
        aadhaar: aadhaar ? aadhaar.trim() : undefined,
        password: hashedPassword,
        pin: hashedPin,
      });
      memoryUsers.push(user.toObject ? user.toObject() : user);
      saveToDisk('users');
    } else {
      user = {
        _id: new mongoose.Types.ObjectId().toString(),
        name: name.trim(),
        email: cleanEmail,
        mobile: cleanMobile,
        aadhaar: aadhaar ? aadhaar.trim() : undefined,
        password: hashedPassword,
        pin: hashedPin,
        isAadhaarVerified: false,
      };
      memoryUsers.push(user);
      saveToDisk('users');
    }

    const token = generateToken(user);

    res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        isAadhaarVerified: user.isAadhaarVerified,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { identifier, pin, password } = req.body;
    const credential = (pin || password || '').toString();

    if (!identifier || !credential) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both identifier and Secure PIN / Password.',
      });
    }

    const cleanId = identifier.trim();

    let user = null;
    if (isDbConnected()) {
      user = await User.findOne({
        $or: [
          { mobile: cleanId },
          { email: cleanId.toLowerCase() },
          { aadhaar: cleanId },
        ],
      });
    } else {
      user = memoryUsers.find(
        (u) =>
          u.mobile === cleanId ||
          u.email === cleanId.toLowerCase() ||
          u.aadhaar === cleanId
      );
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Account does not exist. Please register first.',
      });
    }

    // Validate credentials against stored password or PIN
    let isMatch = false;
    if (user.pin) {
      isMatch = await bcrypt.compare(credential, user.pin);
    }
    if (!isMatch && user.password) {
      isMatch = await bcrypt.compare(credential, user.password);
    }

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please verify your PIN or password.',
      });
    }

    const token = generateToken(user);

    res.json({
      success: true,
      message: 'Authentication successful.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        isAadhaarVerified: user.isAadhaarVerified,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private (Protected by JWT)
const getMe = async (req, res) => {
  res.json({
    success: true,
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      mobile: req.user.mobile,
      isAadhaarVerified: req.user.isAadhaarVerified,
    },
  });
};

module.exports = {
  register,
  login,
  getMe,
};

