const express = require('express');
const router = express.Router();
const {
  getUserDocuments,
  getDocumentById,
  uploadDocument,
  getDocumentFile,
  deleteDocument,
} = require('../controllers/documentController');
const { protect } = require('../middleware/authMiddleware');

// All document routes strictly protected by verified JWT
router.get('/', protect, getUserDocuments);
router.post('/', protect, uploadDocument);
router.get('/:id', protect, getDocumentById);
router.get('/:id/file', protect, getDocumentFile);
router.delete('/:id', protect, deleteDocument);

module.exports = router;

