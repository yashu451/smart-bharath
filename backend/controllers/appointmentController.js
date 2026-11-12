const crypto = require('crypto');
const mongoose = require('mongoose');
const QRCode = require('qrcode');
const Appointment = require('../models/Appointment');
const Activity = require('../models/Activity');
const {
  memoryAppointments,
  memoryActivities,
  saveToDisk,
} = require('../config/memoryStore');
const {
  OFFICIAL_HOLIDAYS,
  checkAppointmentDateAvailability,
  checkAppointmentTimeAvailability,
} = require('../constants/officialHolidays');

// Helper to check MongoDB connection state
const isDbConnected = () => mongoose.connection.readyState === 1;

// Get current date string in Indian Standard Time (YYYY-MM-DD)
const getTodayISTString = () => {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return formatter.format(new Date());
};

// Calculate countdown details in IST
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

// @desc    Book a new office visit appointment
// @route   POST /api/appointments
// @access  Private (Derived strictly from verified JWT)
const bookAppointment = async (req, res, next) => {
  try {
    const userId = (req.user?._id || req.user?.id || '').toString();
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Citizen ID not found in token.',
      });
    }

    const {
      deptId,
      deptName,
      service,
      location,
      state,
      stateName,
      district,
      date,
      time,
      purpose,
      bookingId: customBookingId,
    } = req.body;

    // 1. Validate required fields
    if (!deptName || !service || !location || !date || !time) {
      return res.status(400).json({
        success: false,
        message: 'Department, Service, Location, Date, and Time Slot are required.',
      });
    }

    const stateCode = (state || 'ALL').toUpperCase();
    const districtName = district || '';

    // 2. Validate date is not in the past in IST
    const todayIST = getTodayISTString();
    if (date < todayIST) {
      return res.status(400).json({
        success: false,
        message: `Selected appointment date (${date}) is in the past. Appointments must be scheduled for today or a future date in Indian Standard Time (IST).`,
      });
    }

    // 3. Validate against verified gazetted public holidays and weekend closures
    const dateCheck = checkAppointmentDateAvailability(date, stateCode, districtName);
    if (!dateCheck.available) {
      return res.status(400).json({
        success: false,
        message: `Booking not permitted on ${date}: ${dateCheck.reason}`,
        dateCheck,
      });
    }

    // 4. Validate time slot within official office operating hours
    const timeCheck = checkAppointmentTimeAvailability(time);
    if (!timeCheck.available) {
      return res.status(400).json({
        success: false,
        message: timeCheck.reason,
      });
    }

    // 5. Securely generate unique appointment verification token and booking ID
    const randomSuffix = crypto.randomBytes(10).toString('hex');
    const verificationToken = `sb-vtok-${Date.now().toString(36)}-${randomSuffix}`;
    const bookingId =
      customBookingId && customBookingId.trim()
        ? customBookingId.trim()
        : `APT-SB-${Math.floor(100000 + Math.random() * 900000)}`;

    // 6. Construct client-facing verification URL
    // Priority: Request origin -> Referer -> Environment Client Origin -> Default production domain
    let clientBase = req.get('origin') || '';
    if (!clientBase && req.get('referer')) {
      try {
        const u = new URL(req.get('referer'));
        clientBase = `${u.protocol}//${u.host}`;
      } catch {}
    }
    if (!clientBase) {
      clientBase = process.env.CLIENT_URL || 'https://smart-bharath.onrender.com';
    }
    clientBase = clientBase.replace(/\/+$/, '');
    const verificationUrl = `${clientBase}/appointments/verify?id=${encodeURIComponent(bookingId)}&token=${encodeURIComponent(verificationToken)}`;

    // 7. Generate real, scannable QR Code as Data URL
    let qrCodeDataUrl = null;
    try {
      qrCodeDataUrl = await QRCode.toDataURL(verificationUrl, {
        errorCorrectionLevel: 'M',
        margin: 2,
        width: 256,
        color: {
          dark: '#14532D',
          light: '#FFFFFF',
        },
      });
    } catch (qrErr) {
      console.warn('[Appointment QR Generation Warning]:', qrErr.message);
    }

    const appointmentPayload = {
      userId,
      deptId: deptId || 'passport',
      deptName: deptName.trim(),
      service: service.trim(),
      location: location.trim(),
      state: stateCode,
      stateName: stateName || '',
      district: districtName,
      date: date.trim(),
      time: time.trim(),
      purpose: (purpose || '').trim(),
      bookingId,
      token: `Token: ${bookingId}`,
      verificationToken,
      verificationUrl,
      qrCodeDataUrl,
      status: 'Upcoming',
      statusColor: '#000080',
      statusBg: '#EEF2FF',
      icon: deptId === 'rto' ? '🚗' : deptId === 'aadhaar' ? '🪪' : '🛂',
      isCancelled: false,
      disclaimer: 'Smart Bharat Internal Appointment Verification (Not Official Government Verification)',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    let appointment = null;

    // 8. Save Appointment in MongoDB
    if (isDbConnected()) {
      try {
        appointment = await Appointment.create(appointmentPayload);
        appointment = appointment.toObject ? appointment.toObject() : appointment;
      } catch (dbErr) {
        console.warn('[Appointment] Mongo create fallback:', dbErr.message);
        appointment = { _id: new mongoose.Types.ObjectId().toString(), ...appointmentPayload };
      }
    } else {
      appointment = { _id: new mongoose.Types.ObjectId().toString(), ...appointmentPayload };
    }

    if (Array.isArray(memoryAppointments)) {
      memoryAppointments.unshift(appointment);
      saveToDisk('appointments');
    }

    // 9. Also sync to Activity collection so it shows immediately on Home Dashboard & Recent Activities
    let activity = null;
    try {
      const activityPayload = {
        userId,
        type: 'appointment',
        title: deptName.trim(),
        subtitle: `${service.trim()} • ${date.trim()}, ${time.trim()}`,
        token: `Token: ${bookingId}`,
        status: 'Upcoming',
        statusColor: '#000080',
        statusBg: '#EEF2FF',
        icon: appointmentPayload.icon,
        route: '/appointments/my-appointments',
        metadata: {
          appointmentId: appointment._id,
          deptId: appointmentPayload.deptId,
          deptName: appointmentPayload.deptName,
          service: appointmentPayload.service,
          location: appointmentPayload.location,
          state: appointmentPayload.state,
          stateName: appointmentPayload.stateName,
          district: appointmentPayload.district,
          date: appointmentPayload.date,
          time: appointmentPayload.time,
          bookingId,
          purpose: appointmentPayload.purpose,
          verificationToken,
          verificationUrl,
          qrCodeDataUrl,
          isInternalVerification: true,
          disclaimer: appointmentPayload.disclaimer,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (isDbConnected()) {
        try {
          activity = await Activity.create(activityPayload);
          activity = activity.toObject ? activity.toObject() : activity;
        } catch (actErr) {
          activity = { _id: new mongoose.Types.ObjectId().toString(), ...activityPayload };
        }
      } else {
        activity = { _id: new mongoose.Types.ObjectId().toString(), ...activityPayload };
      }

      if (Array.isArray(memoryActivities)) {
        memoryActivities.unshift(activity);
        saveToDisk('activities');
      }
    } catch (e) {
      console.warn('[Appointment Activity Sync Warning]:', e.message);
    }

    const countdown = calculateISTAppointmentCountdown(appointment.date);

    return res.status(201).json({
      success: true,
      message: 'Office visit appointment scheduled and verified successfully.',
      appointment: {
        ...appointment,
        countdown,
      },
      activity,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all appointments for the authenticated citizen
// @route   GET /api/appointments
// @access  Private
const getMyAppointments = async (req, res, next) => {
  try {
    const userId = (req.user?._id || req.user?.id || '').toString();
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
    }

    let records = [];

    if (isDbConnected()) {
      try {
        records = await Appointment.find({ userId }).sort({ date: 1, createdAt: -1 });
        records = records.map((r) => (r.toObject ? r.toObject() : r));
      } catch (dbErr) {
        console.warn('[Appointments] Mongo lookup fallback:', dbErr.message);
        records = memoryAppointments.filter((a) => (a.userId?.toString() || a.userId) === userId);
      }
    } else {
      records = memoryAppointments.filter((a) => (a.userId?.toString() || a.userId) === userId);
    }

    // If records empty in Appointment collection, check Activity collection for type: 'appointment'
    if (records.length === 0) {
      let actRecords = [];
      if (isDbConnected()) {
        try {
          actRecords = await Activity.find({ userId, type: 'appointment' }).sort({ createdAt: -1 });
          actRecords = actRecords.map((r) => (r.toObject ? r.toObject() : r));
        } catch {}
      } else {
        actRecords = memoryActivities.filter(
          (a) => (a.userId?.toString() || a.userId) === userId && a.type === 'appointment'
        );
      }

      records = actRecords.map((a) => ({
        _id: a._id,
        userId: a.userId,
        deptId: a.metadata?.deptId || 'passport',
        deptName: a.title,
        service: a.metadata?.service || a.subtitle || 'Public Service Visit',
        location: a.metadata?.location || 'Civic Center',
        state: a.metadata?.state || 'ALL',
        stateName: a.metadata?.stateName || '',
        district: a.metadata?.district || '',
        date: a.metadata?.date || '',
        time: a.metadata?.time || '',
        purpose: a.metadata?.purpose || '',
        bookingId: a.metadata?.bookingId || a.token?.replace(/^Token:\s*/i, '').trim() || a._id,
        verificationToken: a.metadata?.verificationToken || '',
        verificationUrl: a.metadata?.verificationUrl || '',
        qrCodeDataUrl: a.metadata?.qrCodeDataUrl || null,
        status: a.status || 'Upcoming',
        statusColor: a.statusColor || '#000080',
        statusBg: a.statusBg || '#EEF2FF',
        icon: a.icon || '🛂',
        isCancelled: a.status === 'Cancelled',
        createdAt: a.createdAt,
      }));
    }

    // Enhance records with calculated IST countdown
    const enhanced = records.map((appt) => {
      const countdown = calculateISTAppointmentCountdown(appt.date);
      return {
        ...appt,
        countdown,
      };
    });

    res.json({
      success: true,
      count: enhanced.length,
      appointments: enhanced,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single appointment details
// @route   GET /api/appointments/:id
// @access  Private
const getAppointmentById = async (req, res, next) => {
  try {
    const userId = (req.user?._id || req.user?.id || '').toString();
    const id = req.params.id;

    let appt = null;

    if (isDbConnected()) {
      try {
        appt = await Appointment.findOne({
          userId,
          $or: [
            { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : undefined },
            { bookingId: id },
            { verificationToken: id },
          ].filter(Boolean),
        });
        if (appt && appt.toObject) appt = appt.toObject();
      } catch {}
    }

    if (!appt && Array.isArray(memoryAppointments)) {
      appt = memoryAppointments.find(
        (a) =>
          (a.userId?.toString() || a.userId) === userId &&
          ((a._id || a.id)?.toString() === id || a.bookingId === id || a.verificationToken === id)
      );
    }

    if (!appt) {
      return res.status(404).json({
        success: false,
        message: 'Appointment record not found.',
      });
    }

    const countdown = calculateISTAppointmentCountdown(appt.date);

    res.json({
      success: true,
      appointment: {
        ...appt,
        countdown,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reschedule appointment date & time
// @route   PATCH /api/appointments/:id/reschedule
// @access  Private
const rescheduleAppointment = async (req, res, next) => {
  try {
    const userId = (req.user?._id || req.user?.id || '').toString();
    const id = req.params.id;
    const { date, time } = req.body;

    if (!date || !time) {
      return res.status(400).json({
        success: false,
        message: 'New Date and Time Slot are required to reschedule.',
      });
    }

    // 1. Validate date is not in the past in IST
    const todayIST = getTodayISTString();
    if (date < todayIST) {
      return res.status(400).json({
        success: false,
        message: `New appointment date (${date}) cannot be in the past. Please select today or a future date.`,
      });
    }

    let appt = null;

    if (isDbConnected()) {
      try {
        appt = await Appointment.findOne({
          userId,
          $or: [
            { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : undefined },
            { bookingId: id },
          ].filter(Boolean),
        });
      } catch {}
    }

    if (!appt && Array.isArray(memoryAppointments)) {
      appt = memoryAppointments.find(
        (a) =>
          (a.userId?.toString() || a.userId) === userId &&
          ((a._id || a.id)?.toString() === id || a.bookingId === id)
      );
    }

    if (!appt) {
      return res.status(404).json({
        success: false,
        message: 'Appointment record not found or not owned by you.',
      });
    }

    // 2. Validate holiday closure
    const dateCheck = checkAppointmentDateAvailability(date, appt.state || 'ALL', appt.district || '');
    if (!dateCheck.available) {
      return res.status(400).json({
        success: false,
        message: dateCheck.reason,
      });
    }

    // 3. Validate time slot
    const timeCheck = checkAppointmentTimeAvailability(time);
    if (!timeCheck.available) {
      return res.status(400).json({
        success: false,
        message: timeCheck.reason,
      });
    }

    appt.date = date.trim();
    appt.time = time.trim();
    appt.status = 'Upcoming';
    appt.isCancelled = false;
    appt.statusColor = '#000080';
    appt.statusBg = '#EEF2FF';

    if (isDbConnected() && appt.save) {
      await appt.save();
    }
    saveToDisk('appointments');

    // Sync corresponding Activity
    try {
      const bId = appt.bookingId;
      const newSub = `${appt.service} • ${date.trim()}, ${time.trim()}`;
      if (isDbConnected()) {
        await Activity.findOneAndUpdate(
          { userId, 'metadata.bookingId': bId },
          {
            subtitle: newSub,
            status: 'Upcoming',
            statusColor: '#000080',
            statusBg: '#EEF2FF',
            'metadata.date': date.trim(),
            'metadata.time': time.trim(),
            'metadata.status': 'Upcoming',
            'metadata.isCancelled': false,
          }
        );
      }
      const act = memoryActivities.find(
        (a) => (a.userId?.toString() || a.userId) === userId && a.metadata?.bookingId === bId
      );
      if (act) {
        act.subtitle = newSub;
        act.status = 'Upcoming';
        act.statusColor = '#000080';
        act.statusBg = '#EEF2FF';
        if (act.metadata) {
          act.metadata.date = date.trim();
          act.metadata.time = time.trim();
          act.metadata.status = 'Upcoming';
          act.metadata.isCancelled = false;
        }
      }
      saveToDisk('activities');
    } catch (e) {
      console.warn('[Appointment Reschedule Activity Sync Note]:', e.message);
    }

    res.json({
      success: true,
      message: `Appointment rescheduled to ${date} at ${time} (IST).`,
      appointment: {
        ...(appt.toObject ? appt.toObject() : appt),
        countdown: calculateISTAppointmentCountdown(date),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel appointment
// @route   PATCH /api/appointments/:id/cancel
// @access  Private
const cancelAppointment = async (req, res, next) => {
  try {
    const userId = (req.user?._id || req.user?.id || '').toString();
    const id = req.params.id;

    let appt = null;

    if (isDbConnected()) {
      try {
        appt = await Appointment.findOne({
          userId,
          $or: [
            { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : undefined },
            { bookingId: id },
          ].filter(Boolean),
        });
      } catch {}
    }

    if (!appt && Array.isArray(memoryAppointments)) {
      appt = memoryAppointments.find(
        (a) =>
          (a.userId?.toString() || a.userId) === userId &&
          ((a._id || a.id)?.toString() === id || a.bookingId === id)
      );
    }

    if (!appt) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found or not owned by you.',
      });
    }

    appt.status = 'Cancelled';
    appt.isCancelled = true;
    appt.statusColor = '#DC2626';
    appt.statusBg = '#FEE2E2';

    if (isDbConnected() && appt.save) {
      await appt.save();
    }
    saveToDisk('appointments');

    // Sync corresponding Activity
    try {
      const bId = appt.bookingId;
      if (isDbConnected()) {
        await Activity.findOneAndUpdate(
          { userId, 'metadata.bookingId': bId },
          {
            status: 'Cancelled',
            statusColor: '#DC2626',
            statusBg: '#FEE2E2',
            'metadata.status': 'Cancelled',
            'metadata.isCancelled': true,
          }
        );
      }
      const act = memoryActivities.find(
        (a) => (a.userId?.toString() || a.userId) === userId && a.metadata?.bookingId === bId
      );
      if (act) {
        act.status = 'Cancelled';
        act.statusColor = '#DC2626';
        act.statusBg = '#FEE2E2';
        if (act.metadata) {
          act.metadata.status = 'Cancelled';
          act.metadata.isCancelled = true;
        }
      }
      saveToDisk('activities');
    } catch (e) {
      console.warn('[Appointment Cancel Activity Sync Note]:', e.message);
    }

    res.json({
      success: true,
      message: 'Appointment has been cancelled.',
    });
  } catch (error) {
    next(error);
  }
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

    let apptRecord = null;

    // 1. Look up in Appointment collection first
    if (isDbConnected()) {
      try {
        apptRecord = await Appointment.findOne({
          $or: [
            { verificationToken: rawToken },
            { bookingId: rawToken },
            { token: rawToken },
            { token: `Token: ${rawToken}` },
          ],
        });

        if (!apptRecord && rawToken.match(/^[0-9a-fA-F]{24}$/)) {
          apptRecord = await Appointment.findById(rawToken);
        }
      } catch (dbErr) {
        console.warn('[Appointment Verification] Mongo lookup warning:', dbErr.message);
      }
    }

    // 2. Memory appointments store fallback
    if (!apptRecord && Array.isArray(memoryAppointments)) {
      apptRecord = memoryAppointments.find(
        (a) =>
          a.verificationToken === rawToken ||
          a.bookingId === rawToken ||
          a.token === rawToken ||
          a.token === `Token: ${rawToken}` ||
          (a._id || a.id)?.toString() === rawToken
      );
    }

    // 3. Activity collection fallback
    if (!apptRecord && isDbConnected()) {
      try {
        const act = await Activity.findOne({
          $or: [
            { 'metadata.verificationToken': rawToken },
            { 'metadata.bookingId': rawToken },
            { token: rawToken },
            { token: `Token: ${rawToken}` },
          ],
        });
        if (act) {
          apptRecord = {
            _id: act._id,
            bookingId: act.metadata?.bookingId || act.token || act._id,
            verificationToken: act.metadata?.verificationToken || rawToken,
            deptName: act.title,
            service: act.metadata?.service || 'Public Service Visit',
            location: act.metadata?.location || 'Central Civic Center',
            state: act.metadata?.state || 'ALL',
            district: act.metadata?.district || '',
            date: act.metadata?.date || '',
            time: act.metadata?.time || '',
            purpose: act.metadata?.purpose || 'Public Office Appointment',
            status: act.status || 'Upcoming',
            isCancelled: act.status === 'Cancelled' || act.metadata?.isCancelled === true,
            createdAt: act.createdAt,
            qrCodeDataUrl: act.metadata?.qrCodeDataUrl || null,
          };
        }
      } catch {}
    }

    // 4. Memory activities fallback
    if (!apptRecord && Array.isArray(memoryActivities)) {
      const act = memoryActivities.find(
        (a) =>
          a.metadata?.verificationToken === rawToken ||
          a.metadata?.bookingId === rawToken ||
          a.token === rawToken ||
          a.token === `Token: ${rawToken}` ||
          (a._id || a.id)?.toString() === rawToken
      );
      if (act) {
        apptRecord = {
          _id: act._id,
          bookingId: act.metadata?.bookingId || act.token || act._id,
          verificationToken: act.metadata?.verificationToken || rawToken,
          deptName: act.title,
          service: act.metadata?.service || 'Public Service Visit',
          location: act.metadata?.location || 'Central Civic Center',
          state: act.metadata?.state || 'ALL',
          district: act.metadata?.district || '',
          date: act.metadata?.date || '',
          time: act.metadata?.time || '',
          purpose: act.metadata?.purpose || 'Public Office Appointment',
          status: act.status || 'Upcoming',
          isCancelled: act.status === 'Cancelled' || act.metadata?.isCancelled === true,
          createdAt: act.createdAt,
          qrCodeDataUrl: act.metadata?.qrCodeDataUrl || null,
        };
      }
    }

    if (!apptRecord) {
      return res.status(404).json({
        success: false,
        isValid: false,
        verificationStatus: 'UNAVAILABLE',
        message: 'No appointment record found matching this verification token or ID.',
        verificationNotice:
          'Smart Bharat Internal Appointment Verification. Note: This token was not found in our database records.',
      });
    }

    const isCancelled = apptRecord.status === 'Cancelled' || apptRecord.isCancelled === true;
    const verificationStatus = isCancelled ? 'CANCELLED' : 'VALID_SCHEDULED';

    res.json({
      success: true,
      isValid: !isCancelled,
      verificationStatus,
      verificationNotice:
        "Smart Bharat Internal Appointment Verification. Note: This verifies the scheduled appointment in the Smart Bharat Citizen Portal. Official office integration is not yet active; this serves as Smart Bharat's internal citizen gatepass, not an official government dispatch.",
      appointment: {
        id: apptRecord._id,
        bookingId: apptRecord.bookingId || apptRecord.token || apptRecord._id,
        token: apptRecord.verificationToken || rawToken,
        department: apptRecord.deptName || apptRecord.title || 'Civic Department',
        service: apptRecord.service || 'Public Service Visit',
        location: apptRecord.location || 'Central Civic Center',
        state: apptRecord.state || 'ALL',
        district: apptRecord.district || '',
        date: apptRecord.date || '',
        time: apptRecord.time || '',
        purpose: apptRecord.purpose || 'Public Office Appointment',
        status: apptRecord.status || (isCancelled ? 'Cancelled' : 'Upcoming'),
        isCancelled,
        bookedOn: apptRecord.createdAt,
        qrCodeDataUrl: apptRecord.qrCodeDataUrl || null,
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
  bookAppointment,
  getMyAppointments,
  getAppointmentById,
  rescheduleAppointment,
  cancelAppointment,
  verifyAppointment,
  getOfficialHolidays,
  calculateISTAppointmentCountdown,
  getTodayISTString,
};
