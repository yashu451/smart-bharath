const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getSavedSchemes,
  checkIsSaved,
  saveScheme,
  removeSavedScheme,
  recordSchemeApplication,
  evaluateSchemes,
} = require('../controllers/schemeController');

// Public/Private Scheme Evaluation Engine
router.post('/evaluate', evaluateSchemes);
router.post('/recommendations', evaluateSchemes);

router.use(protect);

router.get('/saved', getSavedSchemes);
router.get('/check/:schemeId', checkIsSaved);
router.post('/save', saveScheme);
router.delete('/save/:schemeId', removeSavedScheme);
router.post('/apply', recordSchemeApplication);

module.exports = router;

