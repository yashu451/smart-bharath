const mongoose = require('mongoose');
const ChatMessage = require('../models/ChatMessage');
const Activity = require('../models/Activity');
const { memoryChat, memoryActivities, saveToDisk } = require('../config/memoryStore');
const { resolveCitizenUserIds, buildUserFilter } = require('../config/userResolution');

const isDbConnected = () => mongoose.connection.readyState === 1;

// @desc    Get chat message history for authenticated user
// @route   GET /api/chat
// @access  Private (JWT derived userId)
const getChatHistory = async (req, res, next) => {
  try {
    const userIds = await resolveCitizenUserIds(req.user);
    const userFilter = buildUserFilter(userIds);
    let messages = [];

    if (isDbConnected()) {
      try {
        messages = await ChatMessage.find(userFilter).sort({ createdAt: 1 });
      } catch (dbErr) {
        console.warn('[Chat] Mongo fallback:', dbErr.message);
        messages = memoryChat.filter((m) => userIds.includes(m.userId?.toString() || m.userId));
      }
    } else {
      messages = memoryChat.filter((m) => userIds.includes(m.userId?.toString() || m.userId));
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
    const userIds = await resolveCitizenUserIds(req.user);
    const userFilter = buildUserFilter(userIds);
    const userId = (req.user._id || req.user.id).toString();

    if (isDbConnected()) {
      try {
        await ChatMessage.deleteMany(userFilter);
      } catch (dbErr) {
        console.warn('[Clear Chat] Mongo error:', dbErr.message);
      }
    }
    const filtered = memoryChat.filter((m) => !userIds.includes(m.userId?.toString() || m.userId));
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

// @desc    Generate AI response using Gemini and persist conversation in MongoDB
// @route   POST /api/chat/message
// @access  Private (JWT derived userId)
const sendChatMessage = async (req, res, next) => {
  try {
    const userId = req.user ? (req.user._id || req.user.id).toString() : null;
    const { text, message, history, currentMessages } = req.body;
    const userText = (text || message || '').trim();

    if (!userText) {
      return res.status(400).json({
        success: false,
        message: 'Message text is required.',
      });
    }

    const apiKey = (process.env.GEMINI_API_KEY || process.env.EXPO_PUBLIC_GEMINI_API_KEY || '').trim();
    if (!apiKey) {
      console.warn('[Gemini AI] GEMINI_API_KEY is not set in backend environment.');
      return res.status(503).json({
        success: false,
        message: 'The AI Assistant service is temporarily unavailable. Please try again shortly.',
      });
    }

    // Format chat history for Gemini contents
    let contents = [];
    const rawHistory = history || currentMessages || [];
    if (Array.isArray(rawHistory) && rawHistory.length > 0) {
      contents = rawHistory
        .filter((msg) => msg && msg.id !== '1' && (msg.text || (msg.parts && msg.parts[0]?.text)))
        .map((msg) => ({
          role: msg.sender === 'user' || msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: (msg.text || msg.parts?.[0]?.text || '').trim() }],
        }));
    }

    // Append current user message to contents if not already at the end
    const lastItem = contents[contents.length - 1];
    if (!lastItem || lastItem.role !== 'user' || lastItem.parts?.[0]?.text !== userText) {
      contents.push({
        role: 'user',
        parts: [{ text: userText }],
      });
    }

    // Ensure the conversation starts with 'user'
    while (contents.length > 0 && contents[0].role !== 'user') {
      contents.shift();
    }

    const systemInstruction = {
      parts: [
        {
          text: 'You are Smart Bharat AI, a helpful multilingual AI civic companion for the Smart Bharat app. Assist citizens with government schemes, DigiLocker certificates, civic grievances, and appointments. CRITICAL RULE: You MUST auto-detect the language of the user message and respond in the EXACT same language (English, Hindi, Kannada, Tamil, Telugu, Malayalam, or Marathi). NEVER translate the text or switch to English unless the user explicitly requests you to translate. Respond in a highly concise, professional, and premium tone.',
        },
      ],
    };

    // Call Gemini API (gemini-2.5-flash)
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    const geminiRes = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents,
        systemInstruction,
      }),
    });

    if (!geminiRes.ok) {
      const errorBody = await geminiRes.text().catch(() => '');
      console.error('[Gemini API HTTP Error]', geminiRes.status, errorBody);
      return res.status(502).json({
        success: false,
        message: 'The AI Assistant service encountered a temporary error. Please try again in a moment.',
      });
    }

    const geminiData = await geminiRes.json();
    const replyText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!replyText) {
      return res.status(502).json({
        success: false,
        message: 'AI Assistant did not return a response. Please rephrase your query.',
      });
    }

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Persist user and AI messages in MongoDB
    if (userId) {
      try {
        const userMsgData = {
          userId,
          sender: 'user',
          text: userText,
          timestamp,
          createdAt: new Date().toISOString(),
        };
        const aiMsgData = {
          userId,
          sender: 'ai',
          text: replyText,
          timestamp,
          createdAt: new Date().toISOString(),
        };

        if (isDbConnected()) {
          await ChatMessage.create(userMsgData);
          await ChatMessage.create(aiMsgData);
        }
        memoryChat.push(userMsgData, aiMsgData);
        saveToDisk('chat');

        // Centralized Activity tracking
        const preview = userText.length > 55 ? userText.slice(0, 52) + '...' : userText;
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
          metadata: { userQuery: userText },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        if (isDbConnected()) {
          await Activity.create(actData);
        }
        memoryActivities.unshift({ _id: new mongoose.Types.ObjectId().toString(), ...actData });
        saveToDisk('activities');
      } catch (saveErr) {
        console.warn('[Chat DB Save Warning]', saveErr.message);
      }
    }

    res.json({
      success: true,
      reply: replyText,
      timestamp,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getChatHistory,
  saveChatMessage,
  clearChatHistory,
  sendChatMessage,
};
