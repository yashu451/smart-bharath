const express = require('express');
const router = express.Router();
const {
  getDashboardData,
  getUserActivities,
  createActivity,
  cancelActivity,
  updateActivity,
  migrateHistoricalActivities,
} = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');

// All dashboard routes strictly protected with verified JWT
router.get('/', protect, getDashboardData);
router.get('/activities', protect, getUserActivities);
router.post('/activities', protect, createActivity);
router.patch('/activities/:id', protect, updateActivity);
router.patch('/activities/:id/cancel', protect, cancelActivity);
router.post('/migrate-history', protect, migrateHistoricalActivities);

module.exports = router;
