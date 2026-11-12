const crypto = require('crypto');
const Activity = require('../models/Activity');
const { memoryActivities } = require('../config/memoryStore');
const {
  OFFICIAL_HOLIDAYS,
  checkAppointmentDateAvailability,
  checkAppointmentTimeAvailability,
} = require('../constants/officialHolidays');

// Helper to check MongoDB connection state
const isDbConnected = () => {
  const mongoose = require('mongoose');
  return mongoose.connection.readyState === 1;
};

// @desc    Public appointment verification (scanned from QR code or direct URL)
// @route   GET /api/appointments/verify/:token
// @access  Public (No JWT needed, enables instant scanning by any citizen or reception desk)
const verifyAppointment = async (req, res, next) => {
  try {
    const rawToken = (req.params.token || req.query.token || req.query.id || '').trim();

    if (!rawToken) {
      return res.status(400).json({
        success: false,
        isValid: false,
        verificationStatus: 'INVALID_REQUEST',
        message: 'Appointment verification token or ID is required.',
      });
    }

    let activity = null;

    if (isDbConnected()) {
      try {
        activity = await Activity.findOne({
          $or: [
            { 'metadata.verificationToken': rawToken },
            { 'metadata.bookingId': rawToken },
            { token: rawToken },
            { token: `Token: ${rawToken}` },
          ],
        });

        // Also check if valid Mongo ObjectId
        if (!activity && rawToken.match(/^[0-9a-fA-F]{24}$/)) {
          activity = await Activity.findById(rawToken);
        }
      } catch (dbErr) {
        console.warn('[Appointment Verification] Mongo lookup warning:', dbErr.message);
      }
    }

    // Check memory store fallback
    if (!activity && Array.isArray(memoryActivities)) {
      activity = memoryActivities.find(
        (a) =>
          a.metadata?.verificationToken === rawToken ||
          a.metadata?.bookingId === rawToken ||
          a.token === rawToken ||
          a.token === `Token: ${rawToken}` ||
          (a._id || a.id)?.toString() === rawToken
      );
    }

    if (!activity) {
      return res.status(404).json({
        success: false,
        isValid: false,
        verificationStatus: 'UNAVAILABLE',
        message: 'No appointment record found matching this verification token or ID.',
        verificationNotice:
          'Smart Bharat Internal Appointment Verification. Note: This token was not found in our database records.',
      });
    }

    const isCancelled =
      activity.status === 'Cancelled' ||
      activity.metadata?.isCancelled === true ||
      activity.metadata?.status === 'Cancelled';

    const verificationStatus = isCancelled ? 'CANCELLED' : 'VALID_SCHEDULED';

    res.json({
      success: true,
      isValid: !isCancelled,
      verificationStatus,
      verificationNotice:
        "Smart Bharat Internal Appointment Verification. Note: This verifies the scheduled appointment in the Smart Bharat Citizen Portal. Official office integration is not yet active; this serves as Smart Bharat's internal citizen gatepass, not an official government dispatch.",
      appointment: {
        id: activity._id,
        bookingId: activity.metadata?.bookingId || activity.token || activity._id,
        token: activity.metadata?.verificationToken || rawToken,
        department: activity.title,
        service: activity.metadata?.service || 'Public Service Visit',
        location: activity.metadata?.location || 'Central Civic Center',
        state: activity.metadata?.state || 'ALL',
        district: activity.metadata?.district || '',
        date: activity.metadata?.date || '',
        time: activity.metadata?.time || '',
        purpose: activity.metadata?.purpose || 'Public Office Appointment',
        status: activity.status || (isCancelled ? 'Cancelled' : 'Upcoming'),
        isCancelled,
        bookedOn: activity.createdAt,
        qrCodeDataUrl: activity.metadata?.qrCodeDataUrl || null,
        isInternalVerification: true,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get verified official holidays for a specific year and optional state
// @route   GET /api/appointments/holidays
// @access  Public
const getOfficialHolidays = async (req, res, next) => {
  try {
    const year = parseInt(req.query.year, 10) || 2026;
    const state = (req.query.state || 'ALL').toUpperCase();

    const holidays = OFFICIAL_HOLIDAYS.filter((h) => {
      const matchYear = h.year === year;
      const matchState = state === 'ALL' ? true : h.state === 'ALL' || h.state === state;
      return matchYear && matchState;
    });

    res.json({
      success: true,
      year,
      state,
      total: holidays.length,
      holidays,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  verifyAppointment,
  getOfficialHolidays,
};
