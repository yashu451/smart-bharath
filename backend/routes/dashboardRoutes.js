const express = require('express');
const router = express.Router();
const {
  getDashboardData,
  getUserActivities,
  createActivity,
  cancelActivity,
  updateActivity,
} = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');

// All dashboard routes strictly protected with verified JWT
router.get('/', protect, getDashboardData);
router.get('/activities', protect, getUserActivities);
router.post('/activities', protect, createActivity);
router.patch('/activities/:id', protect, updateActivity);
router.patch('/activities/:id/cancel', protect, cancelActivity);

module.exports = router;
