const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

// Ensure environment variables are loaded
dotenv.config({ path: path.join(__dirname, '../.env') });
dotenv.config();

const User = require('../models/User');
const { memoryUsers } = require('../config/memoryStore');

const isDbConnected = () => mongoose.connection.readyState === 1;

/**
 * Authentication Middleware:
 * Strictly verifies JWT bearer token from Authorization header.
 * Identifies the authenticated citizen and binds req.user.
 */
const protect = async (req, res, next) => {
  let token;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer')) {
    try {
      const parts = authHeader.split(' ');
      if (parts.length >= 2) {
        token = parts.slice(1).join(' ').trim().replace(/^["']|["']$/g, '');
      }

      if (!token || token === 'null' || token === 'undefined') {
        return res.status(401).json({
          success: false,
          message: 'Not authorized, valid token is missing.',
        });
      }

      const jwtSecret = process.env.JWT_SECRET || 'smart-bharat-jwt-secret-key-2026';
      const decoded = jwt.verify(token, jwtSecret);

      const userId = decoded.id || decoded._id || decoded.userId;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Not authorized, token payload is invalid.',
        });
      }

      let user = null;

      // 1. Attempt to fetch citizen record from MongoDB if connected
      if (isDbConnected()) {
        try {
          user = await User.findById(userId).select('-password -pin');
          if (user) {
            user = user.toObject ? user.toObject() : user;
          }
        } catch (dbErr) {
          user = null;
        }
      }

      // 2. Fallback to memory store if Mongo is not connected or in-flight
      if (!user) {
        user = memoryUsers.find(
          (u) => (u._id || u.id)?.toString() === userId.toString()
        );
      }

      // 3. If token is verified with our server secret, reconstruct the authenticated citizen session
      // This prevents 401 crashes on server reload / network reconnects for legitimate citizens
      if (!user) {
        user = {
          _id: userId,
          id: userId,
          name: decoded.name || 'Citizen',
          email: decoded.email || '',
          mobile: decoded.mobile || '',
          isAadhaarVerified: !!decoded.isAadhaarVerified,
        };
        // Register into memory store for fast subsequent lookups
        memoryUsers.push(user);
      }

      // Standardize req.user with both _id and id properties
      req.user = {
        ...user,
        _id: user._id || user.id || userId,
        id: user.id || user._id || userId,
      };

      return next();
    } catch (error) {
      console.warn('[AuthMiddleware] Token verification failed:', error.message);
      return res.status(401).json({
        success: false,
        message: 'Not authorized, token invalid or expired.',
      });
    }
  } else {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no authorization token provided.',
    });
  }
};

module.exports = { protect };
