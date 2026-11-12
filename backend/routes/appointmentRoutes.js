const express = require('express');
const router = express.Router();
const {
  verifyAppointment,
  getOfficialHolidays,
} = require('../controllers/appointmentController');

// Public verification endpoints - accessible when scanning QR code with camera
router.get('/verify/:token', verifyAppointment);
router.get('/verify', verifyAppointment);
router.get('/holidays', getOfficialHolidays);

module.exports = router;

