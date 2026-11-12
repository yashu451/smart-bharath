const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  bookAppointment,
  getMyAppointments,
  getAppointmentById,
  rescheduleAppointment,
  cancelAppointment,
  verifyAppointment,
  getOfficialHolidays,
} = require('../controllers/appointmentController');

// ==========================================
// PUBLIC VERIFICATION & HOLIDAY DIRECTORY
// ==========================================
// Public verification endpoints - accessible when scanning QR code with camera or visiting link directly
router.get('/verify/:token', verifyAppointment);
router.get('/verify', verifyAppointment);
router.get('/holidays', getOfficialHolidays);

// ==========================================
// CITIZEN AUTHENTICATED APPOINTMENT ROUTES
// ==========================================
// Book a new appointment (validates date/time/holidays, generates QR, saves to MongoDB)
router.post('/', protect, bookAppointment);
router.post('/book', protect, bookAppointment);

// Retrieve all appointments for the logged-in citizen
router.get('/', protect, getMyAppointments);
router.get('/my', protect, getMyAppointments);

// Retrieve single appointment by ID / bookingId
router.get('/:id', protect, getAppointmentById);

// Reschedule appointment
router.patch('/:id/reschedule', protect, rescheduleAppointment);
router.patch('/:id', protect, rescheduleAppointment);

// Cancel appointment
router.patch('/:id/cancel', protect, cancelAppointment);
router.delete('/:id', protect, cancelAppointment);

module.exports = router;
