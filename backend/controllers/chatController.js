const mongoose = require('mongoose');
const ChatMessage = require('../models/ChatMessage');
const Activity = require('../models/Activity');
const { memoryChat, memoryActivities, saveToDisk } = require('../config/memoryStore');

const isDbConnected = () => mongoose.connection.readyState === 1;

// @desc    Get chat message history for authenticated user
// @route   GET /api/chat
// @access  Private (JWT derived userId)
const getChatHistory = async (req, res, next) => {
  try {
    const userId = (req.user._id || req.user.id).toString();
    let messages = [];

    if (isDbConnected()) {
      try {
        messages = await ChatMessage.find({ userId }).sort({ createdAt: 1 });
      } catch (dbErr) {
        console.warn('[Chat] Mongo fallback:', dbErr.message);
        messages = memoryChat.filter((m) => (m.userId?.toString() || m.userId) === userId);
      }
    } else {
      messages = memoryChat.filter((m) => (m.userId?.toString() || m.userId) === userId);
    }

    res.json({
      success: true,
      count: messages.length,
      messages,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Save a chat message for authenticated user
// @route   POST /api/chat
// @access  Private (JWT derived userId)
const saveChatMessage = async (req, res, next) => {
  try {
    const userId = (req.user._id || req.user.id).toString();
    const { sender, text, suggestedAction, timestamp } = req.body;

    if (!sender || !text) {
      return res.status(400).json({
        success: false,
        message: 'Sender and text are required to record a chat message.',
      });
    }

    let message = null;
    const msgData = {
      userId,
      sender,
      text: text.trim(),
      suggestedAction: suggestedAction || null,
      timestamp: timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      createdAt: new Date().toISOString(),
    };

    if (isDbConnected()) {
      try {
        message = await ChatMessage.create(msgData);
        memoryChat.push(message.toObject ? message.toObject() : message);
      } catch (dbErr) {
        console.warn('[Chat Save] Mongo fallback:', dbErr.message);
        message = { _id: new mongoose.Types.ObjectId().toString(), ...msgData };
        memoryChat.push(message);
      }
    } else {
      message = { _id: new mongoose.Types.ObjectId().toString(), ...msgData };
      memoryChat.push(message);
    }
    saveToDisk('chat');

    // Centralized Activity history tracking for AI Assistant interactions
    if (sender === 'user') {
      try {
        const preview = text.trim().length > 55 ? text.trim().slice(0, 52) + '...' : text.trim();
        const actData = {
          userId,
          type: 'assistant',
          title: 'AI Civic Assistant',
          subtitle: `Query: "${preview}"`,
          token: `Token: AI-${Date.now().toString().slice(-6)}`,
          status: 'Query Answered',
          statusColor: '#4338CA',
          statusBg: '#EEF2FF',
          icon: '🤖',
          route: '/assistant',
          metadata: {
            userQuery: text.trim(),
            suggestedAction: suggestedAction || null,
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        if (isDbConnected()) {
          try {
            await Activity.create(actData);
          } catch (actErr) {
            console.warn('[Activity AI] Mongo fallback:', actErr.message);
          }
        }

        memoryActivities.unshift({
          _id: new mongoose.Types.ObjectId().toString(),
          ...actData,
        });
        saveToDisk('activities');
      } catch (e) {
        console.warn('AI Activity tracking note:', e.message);
      }
    }

    res.status(201).json({
      success: true,
      message,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Clear chat history for authenticated user
// @route   DELETE /api/chat
// @access  Private (JWT derived userId)
const clearChatHistory = async (req, res, next) => {
  try {
    const userId = (req.user._id || req.user.id).toString();
    if (isDbConnected()) {
      try {
        await ChatMessage.deleteMany({ userId });
      } catch {}
    }
    const filtered = memoryChat.filter((m) => (m.userId?.toString() || m.userId) !== userId);
    memoryChat.length = 0;
    memoryChat.push(...filtered);
    saveToDisk('chat');

    res.json({
      success: true,
      message: 'Chat history cleared successfully.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getChatHistory,
  saveChatMessage,
  clearChatHistory,
};
