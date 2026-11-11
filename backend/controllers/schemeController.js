const mongoose = require('mongoose');
const SavedScheme = require('../models/SavedScheme');
const Activity = require('../models/Activity');
const { memorySavedSchemes, memoryActivities, saveToDisk } = require('../config/memoryStore');

const isDbConnected = () => mongoose.connection.readyState === 1;

// @desc    Get all saved schemes for authenticated user
// @route   GET /api/schemes/saved
// @access  Private
const getSavedSchemes = async (req, res, next) => {
  try {
    const userId = (req.user._id || req.user.id).toString();
    let schemes = [];

    if (isDbConnected()) {
      try {
        schemes = await SavedScheme.find({ userId }).sort({ createdAt: -1 });
      } catch (dbErr) {
        console.warn('[Schemes] Mongo fallback:', dbErr.message);
        schemes = memorySavedSchemes.filter((s) => (s.userId?.toString() || s.userId) === userId);
      }
    } else {
      schemes = memorySavedSchemes.filter((s) => (s.userId?.toString() || s.userId) === userId);
    }

    res.json({
      success: true,
      count: schemes.length,
      schemes,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Check if a specific scheme is saved by authenticated user
// @route   GET /api/schemes/check/:schemeId
// @access  Private
const checkIsSaved = async (req, res, next) => {
  try {
    const userId = (req.user._id || req.user.id).toString();
    const { schemeId } = req.params;

    let found = false;

    if (isDbConnected()) {
      try {
        const item = await SavedScheme.findOne({ userId, schemeId });
        if (item) found = true;
      } catch (dbErr) {
        console.warn('[Scheme Check] Mongo fallback:', dbErr.message);
      }
    }

    if (!found) {
      found = memorySavedSchemes.some(
        (s) => (s.userId?.toString() || s.userId) === userId && s.schemeId === schemeId
      );
    }

    res.json({
      success: true,
      isSaved: found,
      schemeId,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Save/Bookmark a government scheme
// @route   POST /api/schemes/save
// @access  Private
const saveScheme = async (req, res, next) => {
  try {
    const userId = (req.user._id || req.user.id).toString();
    const {
      schemeId,
      name,
      category,
      description,
      applicationUrl,
      officialWebsite,
      benefits,
      eligibility,
      hasOnlineApplication,
    } = req.body;

    if (!schemeId || !name) {
      return res.status(400).json({
        success: false,
        message: 'Scheme ID and Name are required.',
      });
    }

    const schemeData = {
      userId,
      schemeId,
      name: name.trim(),
      category: category ? category.trim() : 'Welfare Scheme',
      description: description ? description.trim() : '',
      applicationUrl: applicationUrl ? applicationUrl.trim() : '',
      officialWebsite: officialWebsite ? officialWebsite.trim() : '',
      benefits: benefits ? benefits.trim() : '',
      eligibility: eligibility ? eligibility.trim() : '',
      hasOnlineApplication: !!hasOnlineApplication,
      savedAt: new Date(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    let savedItem = null;

    if (isDbConnected()) {
      try {
        savedItem = await SavedScheme.findOneAndUpdate(
          { userId, schemeId },
          schemeData,
          { upsert: true, new: true }
        );
      } catch (dbErr) {
        console.warn('[Scheme Save] Mongo fallback:', dbErr.message);
      }
    }

    // Always update persistent local store
    const existingIdx = memorySavedSchemes.findIndex(
      (s) => (s.userId?.toString() || s.userId) === userId && s.schemeId === schemeId
    );
    if (existingIdx !== -1) {
      memorySavedSchemes[existingIdx] = { ...memorySavedSchemes[existingIdx], ...schemeData };
      savedItem = memorySavedSchemes[existingIdx];
    } else {
      savedItem = {
        _id: new mongoose.Types.ObjectId().toString(),
        ...schemeData,
      };
      memorySavedSchemes.unshift(savedItem);
    }
    saveToDisk('saved_schemes');

    // Centralized Activity History Record
    try {
      const actData = {
        userId,
        type: 'scheme',
        title: `Saved: ${schemeData.name}`,
        subtitle: `${schemeData.category} • Bookmarked in My Schemes`,
        token: `Token: SCH-${schemeId.toUpperCase()}`,
        status: 'Bookmarked',
        statusColor: '#059669',
        statusBg: '#ECFDF5',
        icon: '🌾',
        route: '/schemes/details',
        metadata: {
          schemeId,
          schemeName: schemeData.name,
          category: schemeData.category,
          applicationUrl: schemeData.applicationUrl,
          action: 'saved',
        },
      };

      if (isDbConnected()) {
        try {
          await Activity.findOneAndUpdate(
            { userId, 'metadata.schemeId': schemeId, 'metadata.action': 'saved' },
            actData,
            { upsert: true, new: true }
          );
        } catch (e) {
          console.warn('Activity upsert note:', e.message);
        }
      }

      const actIdx = memoryActivities.findIndex(
        (a) => (a.userId?.toString() || a.userId) === userId && a.metadata?.schemeId === schemeId && a.metadata?.action === 'saved'
      );
      if (actIdx !== -1) {
        memoryActivities[actIdx] = { ...memoryActivities[actIdx], ...actData, updatedAt: new Date().toISOString() };
      } else {
        memoryActivities.unshift({
          _id: new mongoose.Types.ObjectId().toString(),
          ...actData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
      saveToDisk('activities');
    } catch (actErr) {
      console.warn('Could not record scheme activity:', actErr.message);
    }

    res.status(201).json({
      success: true,
      message: 'Scheme saved successfully.',
      scheme: savedItem,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove saved scheme
// @route   DELETE /api/schemes/save/:schemeId
// @access  Private
const removeSavedScheme = async (req, res, next) => {
  try {
    const userId = (req.user._id || req.user.id).toString();
    const { schemeId } = req.params;

    if (isDbConnected()) {
      try {
        await SavedScheme.findOneAndDelete({ userId, schemeId });
      } catch (dbErr) {
        console.warn('[Scheme Remove] Mongo fallback:', dbErr.message);
      }
    }

    const idx = memorySavedSchemes.findIndex(
      (s) => (s.userId?.toString() || s.userId) === userId && s.schemeId === schemeId
    );
    if (idx !== -1) {
      memorySavedSchemes.splice(idx, 1);
      saveToDisk('saved_schemes');
    }

    // Update or remove activity
    if (isDbConnected()) {
      try {
        await Activity.findOneAndDelete({
          userId,
          'metadata.schemeId': schemeId,
          'metadata.action': 'saved',
        });
      } catch {}
    }
    const actIdx = memoryActivities.findIndex(
      (a) => (a.userId?.toString() || a.userId) === userId && a.metadata?.schemeId === schemeId && a.metadata?.action === 'saved'
    );
    if (actIdx !== -1) {
      memoryActivities.splice(actIdx, 1);
      saveToDisk('activities');
    }

    res.json({
      success: true,
      message: 'Scheme removed from saved list.',
      schemeId,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Record scheme application action on official portal
// @route   POST /api/schemes/apply
// @access  Private
const recordSchemeApplication = async (req, res, next) => {
  try {
    const userId = (req.user._id || req.user.id).toString();
    const { schemeId, name, category, applicationUrl } = req.body;

    const tokenNum = `SCH-${Math.floor(100000 + Math.random() * 900000)}`;
    const actData = {
      userId,
      type: 'scheme',
      title: `${name || 'Government Scheme'} Application`,
      subtitle: `Applied via official portal • Token: ${tokenNum}`,
      token: `Token: ${tokenNum}`,
      status: 'Submitted',
      statusColor: '#16A34A',
      statusBg: '#DCFCE7',
      icon: '🌾',
      route: '/schemes/details',
      metadata: {
        schemeId,
        schemeName: name,
        category: category || 'Welfare Scheme',
        applicationUrl: applicationUrl || '',
        action: 'applied',
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    let activity = null;
    if (isDbConnected()) {
      try {
        activity = await Activity.create(actData);
      } catch (e) {
        console.warn('[Scheme Application] Mongo fallback:', e.message);
      }
    }

    activity = {
      _id: activity ? activity._id : new mongoose.Types.ObjectId().toString(),
      ...actData,
    };
    memoryActivities.unshift(activity);
    saveToDisk('activities');

    res.status(201).json({
      success: true,
      message: 'Scheme application recorded in activity history.',
      activity,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSavedSchemes,
  checkIsSaved,
  saveScheme,
  removeSavedScheme,
  recordSchemeApplication,
};

