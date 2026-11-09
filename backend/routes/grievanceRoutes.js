const express = require('express');
const router = express.Router();
const {
  getGuidance,
  getGrievances,
  getGrievanceInsights,
  createGrievance,
  updateGrievance,
  deleteGrievance,
} = require('../controllers/grievanceController');
const { protect } = require('../middleware/authMiddleware');

// Guidance engine
router.post('/guide', getGuidance);

// Grievances management (Strictly protected by JWT)
router.get('/', protect, getGrievances);
router.get('/insights', protect, getGrievanceInsights);
router.post('/', protect, createGrievance);
router.patch('/:id', protect, updateGrievance);
router.delete('/:id', protect, deleteGrievance);

module.exports = router;

