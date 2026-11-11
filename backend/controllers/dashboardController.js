const mongoose = require('mongoose');
const Activity = require('../models/Activity');
const Document = require('../models/Document');

const { memoryActivities, saveToDisk } = require('../config/memoryStore');

const isDbConnected = () => mongoose.connection.readyState === 1;

const getTodayISTString = () => {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return formatter.format(new Date());
};

const calculateISTAppointmentCountdown = (dateStr) => {
  if (!dateStr || typeof dateStr !== 'string') {
    return { diffDays: 0, isToday: false, isTomorrow: false, isOverdue: false, countdownLabel: '' };
  }
  try {
    const todayStr = getTodayISTString();
    const [tY, tM, tD] = todayStr.split('-').map(Number);
    const [aY, aM, aD] = dateStr.split('-').map(Number);
    if (!aY || !aM || !aD) {
      return { diffDays: 0, isToday: false, isTomorrow: false, isOverdue: false, countdownLabel: '' };
    }
    const diffDays = Math.round((new Date(Date.UTC(aY, aM - 1, aD)) - new Date(Date.UTC(tY, tM - 1, tD))) / 86400000);
    if (diffDays < 0) {
      const absDays = Math.abs(diffDays);
      return {
        diffDays,
        isToday: false,
        isTomorrow: false,
        isOverdue: true,
        countdownLabel: absDays === 1 ? '1 day overdue' : `${absDays} days overdue`,
      };
    }
    if (diffDays === 0) {
      return { diffDays: 0, isToday: true, isTomorrow: false, isOverdue: false, countdownLabel: 'Today' };
    }
    if (diffDays === 1) {
      return { diffDays: 1, isToday: false, isTomorrow: true, isOverdue: false, countdownLabel: 'Tomorrow' };
    }
    return {
      diffDays,
      isToday: false,
      isTomorrow: false,
      isOverdue: false,
      countdownLabel: `${diffDays} days left`,
    };
  } catch {
    return { diffDays: 0, isToday: false, isTomorrow: false, isOverdue: false, countdownLabel: '' };
  }
};

// @desc    Get personalized dashboard data for authenticated user
// @route   GET /api/dashboard
// @access  Private (Derived strictly from verified JWT)
const getDashboardData = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const cleanUserId = userId ? userId.toString() : '';

    let userActivities = [];
    let documentsCount = 0;

    if (isDbConnected()) {
      try {
        userActivities = await Activity.find({ userId: cleanUserId }).sort({ createdAt: -1 });
        const realDocsCount = await Document.countDocuments({ userId: cleanUserId });
        documentsCount = Math.max(
          realDocsCount,
          userActivities.filter((a) => a.type === 'document').length
        );
      } catch (dbErr) {
        console.warn('[Dashboard] Mongo query fallback:', dbErr.message);
        userActivities = memoryActivities
          .filter((a) => (a.userId?.toString() || a.userId) === cleanUserId)
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        documentsCount = userActivities.filter((a) => a.type === 'document').length;
      }
    } else {
      userActivities = memoryActivities
        .filter((a) => (a.userId?.toString() || a.userId) === cleanUserId)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      documentsCount = userActivities.filter((a) => a.type === 'document').length;
    }

    // Enhance appointment activities with IST countdown calculations
    const enrichedActivities = userActivities.map((act) => {
      const actObj = act.toObject ? act.toObject() : { ...act };
      if (actObj.type === 'appointment' && actObj.metadata && actObj.metadata.date) {
        const countdown = calculateISTAppointmentCountdown(actObj.metadata.date);
        return {
          ...actObj,
          countdown,
        };
      }
      return actObj;
    });

    // Separate upcoming office visits and overdue appointments
    const upcomingAppointments = [];
    const overdueAppointments = [];

    enrichedActivities.forEach((act) => {
      if (act.type === 'appointment' && act.status !== 'Cancelled') {
        const countdown = act.countdown || calculateISTAppointmentCountdown(act.metadata?.date);
        if (countdown.isOverdue) {
          overdueAppointments.push({ ...act, countdown });
        } else {
          upcomingAppointments.push({ ...act, countdown });
        }
      }
    });

    // Sort upcoming appointments by nearest date first
    upcomingAppointments.sort((a, b) => {
      const dateA = a.metadata?.date || '';
      const dateB = b.metadata?.date || '';
      return dateA.localeCompare(dateB);
    });

    // Aggregate counts for the user
    const appointmentsCount = userActivities.filter((a) => a.type === 'appointment' && a.status !== 'Cancelled').length;
    const grievancesCount = userActivities.filter((a) => a.type === 'grievance').length;
    const schemesCount = userActivities.filter((a) => a.type === 'scheme').length;
    const assistantCount = userActivities.filter((a) => a.type === 'assistant').length;

    res.json({
      success: true,
      user: {
        id: req.user._id || req.user.id,
        name: req.user.name,
        email: req.user.email,
        mobile: req.user.mobile,
        isAadhaarVerified: req.user.isAadhaarVerified,
      },
      stats: {
        total: userActivities.length,
        appointments: appointmentsCount,
        grievances: grievancesCount,
        schemes: schemesCount,
        documents: documentsCount,
        assistant: assistantCount,
      },
      upcomingAppointments,
      overdueAppointments,
      recentActivities: enrichedActivities,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all activities strictly for authenticated user with optional type filtering
// @route   GET /api/dashboard/activities
// @access  Private (Derived strictly from verified JWT)
const getUserActivities = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const cleanUserId = userId ? userId.toString() : '';
    const { type } = req.query;

    let activities = [];

    if (isDbConnected()) {
      try {
        const filter = { userId: cleanUserId };
        if (type && type !== 'all') {
          filter.type = type;
        }
        activities = await Activity.find(filter).sort({ createdAt: -1 });
      } catch (dbErr) {
        console.warn('[Activities] Mongo query fallback:', dbErr.message);
        activities = memoryActivities
          .filter((a) => (a.userId?.toString() || a.userId) === cleanUserId)
          .filter((a) => (!type || type === 'all' ? true : a.type === type))
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      }
    } else {
      activities = memoryActivities
        .filter((a) => (a.userId?.toString() || a.userId) === cleanUserId)
        .filter((a) => (!type || type === 'all' ? true : a.type === type))
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    const enriched = activities.map((act) => {
      const actObj = act.toObject ? act.toObject() : { ...act };
      if (actObj.type === 'appointment' && actObj.metadata && actObj.metadata.date) {
        return {
          ...actObj,
          countdown: calculateISTAppointmentCountdown(actObj.metadata.date),
        };
      }
      return actObj;
    });

    res.json({
      success: true,
      total: enriched.length,
      activities: enriched,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new activity for the authenticated user
// @route   POST /api/dashboard/activities
// @access  Private (Derived strictly from verified JWT)
const createActivity = async (req, res, next) => {
  try {
    const userId = (req.user._id || req.user.id || '').toString();
    const { type, title, subtitle, token, status, statusColor, statusBg, icon, route, metadata } = req.body;

    if (!type || !title) {
      return res.status(400).json({
        success: false,
        message: 'Type and Title are required to record an activity.',
      });
    }

    const activityData = {
      userId,
      type,
      title: title.trim(),
      subtitle: subtitle ? subtitle.trim() : '',
      token: token ? token.trim() : '',
      status: status || 'In Progress',
      statusColor: statusColor || '#000080',
      statusBg: statusBg || '#EEF2FF',
      icon: icon || '📋',
      route: route || '/home',
      metadata: metadata || {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    let activity = null;

    if (isDbConnected()) {
      try {
        activity = await Activity.create(activityData);
        memoryActivities.unshift(activity.toObject ? activity.toObject() : activity);
      } catch (dbErr) {
        console.warn('[Activity Create] Mongo fallback:', dbErr.message);
        activity = {
          _id: new mongoose.Types.ObjectId().toString(),
          ...activityData,
        };
        memoryActivities.unshift(activity);
      }
    } else {
      activity = {
        _id: new mongoose.Types.ObjectId().toString(),
        ...activityData,
      };
      memoryActivities.unshift(activity);
    }
    saveToDisk('activities');

    res.status(201).json({
      success: true,
      message: 'Activity recorded successfully.',
      activity,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel an activity strictly belonging to authenticated user
// @route   PATCH /api/dashboard/activities/:id/cancel
// @access  Private (Derived strictly from verified JWT)
const cancelActivity = async (req, res, next) => {
  try {
    const userId = (req.user._id || req.user.id || '').toString();
    const { id } = req.params;

    let activity = null;

    if (isDbConnected()) {
      try {
        activity = await Activity.findOneAndUpdate(
          { _id: id, userId },
          { status: 'Cancelled', statusColor: '#DC2626', statusBg: '#FEE2E2' },
          { new: true }
        );
      } catch (dbErr) {
        console.warn('[Activity Cancel] Mongo fallback:', dbErr.message);
      }
    }

    if (!activity) {
      const idx = memoryActivities.findIndex(
        (a) => (a._id || a.id)?.toString() === id.toString() && (a.userId?.toString() || a.userId) === userId
      );
      if (idx !== -1) {
        memoryActivities[idx].status = 'Cancelled';
        memoryActivities[idx].statusColor = '#DC2626';
        memoryActivities[idx].statusBg = '#FEE2E2';
        activity = memoryActivities[idx];
      }
    }
    saveToDisk('activities');

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Activity record not found or not owned by you.',
      });
    }

    res.json({
      success: true,
      message: 'Activity cancelled successfully.',
      activity,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update an activity status and metadata strictly belonging to authenticated user
// @route   PATCH /api/dashboard/activities/:id
// @access  Private (Derived strictly from verified JWT)
const updateActivity = async (req, res, next) => {
  try {
    const userId = (req.user._id || req.user.id || '').toString();
    const { id } = req.params;
    const { status, statusColor, statusBg, subtitle, metadata } = req.body;

    const updates = {};
    if (status) updates.status = status;
    if (statusColor) updates.statusColor = statusColor;
    if (statusBg) updates.statusBg = statusBg;
    if (subtitle) updates.subtitle = subtitle;
    if (metadata) updates.metadata = metadata;

    let activity = null;

    if (isDbConnected()) {
      try {
        activity = await Activity.findOneAndUpdate(
          { _id: id, userId },
          updates,
          { new: true }
        );
      } catch (dbErr) {
        console.warn('[Activity Update] Mongo fallback:', dbErr.message);
      }
    }

    // Also update in memory store
    const memIdx = memoryActivities.findIndex(
      (a) => (a._id || a.id)?.toString() === id.toString() && (a.userId?.toString() || a.userId) === userId
    );
    if (memIdx !== -1) {
      Object.assign(memoryActivities[memIdx], updates, { updatedAt: new Date().toISOString() });
      if (!activity) activity = memoryActivities[memIdx];
      saveToDisk('activities');
    }

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found or does not belong to your account.',
      });
    }

    res.json({
      success: true,
      message: 'Activity status updated successfully.',
      activity,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Migrate historical activities into MongoDB and persistent storage
// @route   POST /api/dashboard/migrate-history
// @access  Private (Derived strictly from verified JWT)
const migrateHistoricalActivities = async (req, res, next) => {
  try {
    const userId = (req.user._id || req.user.id || '').toString();
    const { history } = req.body;

    if (!Array.isArray(history) || history.length === 0) {
      return res.json({ success: true, migratedCount: 0, message: 'No historical records to migrate.' });
    }

    let userActivities = [];
    if (isDbConnected()) {
      try {
        userActivities = await Activity.find({ userId });
      } catch (err) {
        userActivities = memoryActivities.filter((a) => (a.userId?.toString() || a.userId) === userId);
      }
    } else {
      userActivities = memoryActivities.filter((a) => (a.userId?.toString() || a.userId) === userId);
    }

    let migratedCount = 0;

    for (const item of history) {
      if (!item || !item.title) continue;

      const existingToken = item.token ? item.token.trim() : '';
      const isDuplicate = userActivities.some((act) => {
        if (existingToken && act.token && act.token.includes(existingToken.replace(/^Token:\s*/, ''))) {
          return true;
        }
        if (
          act.type === (item.type || 'appointment') &&
          act.title === item.title &&
          act.metadata?.date &&
          item.metadata?.date &&
          act.metadata?.date === item.metadata?.date
        ) {
          return true;
        }
        return false;
      });

      if (!isDuplicate) {
        const actData = {
          userId,
          type: item.type || 'appointment',
          title: item.title.trim(),
          subtitle: item.subtitle ? item.subtitle.trim() : '',
          token: item.token ? item.token.trim() : '',
          status: item.status || 'Upcoming',
          statusColor: item.statusColor || '#000080',
          statusBg: item.statusBg || '#EEF2FF',
          icon: item.icon || '📅',
          route: item.route || '/appointments/my-appointments',
          metadata: item.metadata || {},
          createdAt: item.createdAt || new Date().toISOString(),
          updatedAt: item.updatedAt || new Date().toISOString(),
        };

        let newAct = null;
        if (isDbConnected()) {
          try {
            newAct = await Activity.create(actData);
          } catch (e) {
            console.warn('[Migrate Activity] Mongo create notice:', e.message);
          }
        }

        const memAct = newAct ? (newAct.toObject ? newAct.toObject() : newAct) : {
          _id: new mongoose.Types.ObjectId().toString(),
          ...actData,
        };
        memoryActivities.unshift(memAct);
        userActivities.push(memAct);
        migratedCount++;
      }
    }

    if (migratedCount > 0) {
      saveToDisk('activities');
    }

    res.json({
      success: true,
      message: `Migrated ${migratedCount} historical records successfully.`,
      migratedCount,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardData,
  getUserActivities,
  createActivity,
  cancelActivity,
  updateActivity,
  migrateHistoricalActivities,
};
