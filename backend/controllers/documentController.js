const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const mongoose = require('mongoose');
const Document = require('../models/Document');
const Activity = require('../models/Activity');
const { memoryDocuments } = require('../config/memoryStore');

const isDbConnected = () => mongoose.connection.readyState === 1;

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes

// @desc    Get all personal documents for the authenticated user
// @route   GET /api/documents
// @access  Private (Derived strictly from verified JWT)
const getUserDocuments = async (req, res, next) => {
  try {
    const userId = (req.user._id || req.user.id).toString();
    let documents = [];

    if (isDbConnected()) {
      try {
        documents = await Document.find({ userId }).sort({ createdAt: -1 });
      } catch (dbErr) {
        console.warn('[Documents] Mongo fallback:', dbErr.message);
        documents = memoryDocuments.filter((d) => (d.userId?.toString() || d.userId) === userId);
      }
    } else {
      documents = memoryDocuments.filter((d) => (d.userId?.toString() || d.userId) === userId);
    }

    res.json({
      success: true,
      count: documents.length,
      documents,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single document metadata
// @route   GET /api/documents/:id
// @access  Private
const getDocumentById = async (req, res, next) => {
  try {
    const userId = (req.user._id || req.user.id).toString();
    const document = await Document.findOne({ _id: req.params.id, userId });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found or does not belong to your account.',
      });
    }

    res.json({
      success: true,
      document,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload new document from user's device
// @route   POST /api/documents
// @access  Private (Derived strictly from verified JWT)
const uploadDocument = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { name, category, originalFilename, mimeType, base64Data, description } = req.body;

    if (!name || !originalFilename || !mimeType || !base64Data) {
      return res.status(400).json({
        success: false,
        message: 'Document name, filename, mime type, and file content are required.',
      });
    }

    const cleanMime = mimeType.toLowerCase();
    if (!ALLOWED_MIME_TYPES.includes(cleanMime)) {
      return res.status(400).json({
        success: false,
        message: 'Unsupported file format. Please upload PDF, JPG, or PNG files only.',
      });
    }

    // Clean base64 string if it contains data URI header
    const cleanBase64 = base64Data.replace(/^data:[^;]+;base64,/, '');
    const buffer = Buffer.from(cleanBase64, 'base64');

    if (buffer.length > MAX_FILE_SIZE) {
      return res.status(400).json({
        success: false,
        message: 'File size exceeds 10MB limit. Please upload a smaller file.',
      });
    }

    // Secure isolated user directory
    const uploadDir = path.join(__dirname, '../uploads/documents', userId.toString());
    await fs.promises.mkdir(uploadDir, { recursive: true });

    const ext = path.extname(originalFilename) || (cleanMime === 'application/pdf' ? '.pdf' : '.png');
    const safeFilename = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`;
    const filePath = path.join(uploadDir, safeFilename);

    await fs.promises.writeFile(filePath, buffer);

    let document = null;
    const docData = {
      userId,
      name: name.trim(),
      category: category || 'Identity',
      originalFilename: originalFilename.trim(),
      mimeType: cleanMime,
      size: buffer.length,
      filePath,
      status: 'Uploaded by you – Not officially verified',
      description: description ? description.trim() : '',
      createdAt: new Date().toISOString(),
    };

    if (isDbConnected()) {
      try {
        document = await Document.create(docData);
        memoryDocuments.unshift(document.toObject ? document.toObject() : document);
      } catch (dbErr) {
        console.warn('[Document Create] Mongo fallback:', dbErr.message);
        document = { _id: new mongoose.Types.ObjectId().toString(), ...docData };
        memoryDocuments.unshift(document);
      }
    } else {
      document = { _id: new mongoose.Types.ObjectId().toString(), ...docData };
      memoryDocuments.unshift(document);
    }

    // Also record an activity entry in Citizen History
    try {
      await Activity.create({
        userId,
        type: 'document',
        title: document.name,
        subtitle: `${document.category} • Uploaded Document`,
        token: `DOC-${document._id.toString().slice(-6).toUpperCase()}`,
        status: 'Uploaded',
        statusColor: '#059669',
        statusBg: '#ECFDF5',
        icon: '📁',
        route: '/digilocker/documents',
        metadata: {
          documentId: document._id,
          category: document.category,
          originalFilename: document.originalFilename,
        },
      });
    } catch {
      // Continue even if activity log fails
    }

    res.status(201).json({
      success: true,
      message: 'Document uploaded and securely saved.',
      document,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Download or view document file securely
// @route   GET /api/documents/:id/file
// @access  Private (Derived strictly from verified JWT)
const getDocumentFile = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const document = await Document.findOne({ _id: req.params.id, userId });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found or does not belong to your account.',
      });
    }

    if (!fs.existsSync(document.filePath)) {
      return res.status(404).json({
        success: false,
        message: 'Document file not found on disk storage.',
      });
    }

    // Return base64 preview if requested
    if (req.query.base64 === 'true') {
      const fileBuffer = await fs.promises.readFile(document.filePath);
      return res.json({
        success: true,
        base64: fileBuffer.toString('base64'),
        mimeType: document.mimeType,
        originalFilename: document.originalFilename,
      });
    }

    // Stream the file with secure attachment disposition
    res.setHeader('Content-Type', document.mimeType);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${encodeURIComponent(document.originalFilename)}"`
    );
    const fileStream = fs.createReadStream(document.filePath);
    fileStream.pipe(res);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete document strictly for authenticated owner
// @route   DELETE /api/documents/:id
// @access  Private (Derived strictly from verified JWT)
const deleteDocument = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const document = await Document.findOne({ _id: req.params.id, userId });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found or does not belong to your account.',
      });
    }

    // Remove file from disk
    if (fs.existsSync(document.filePath)) {
      try {
        await fs.promises.unlink(document.filePath);
      } catch (err) {
        console.error('Error unlinking document file:', err.message);
      }
    }

    // Remove from MongoDB
    await Document.deleteOne({ _id: document._id });

    // Remove matching activity
    try {
      await Activity.deleteMany({ userId, 'metadata.documentId': document._id });
    } catch {
      // Continue
    }

    res.json({
      success: true,
      message: 'Document deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUserDocuments,
  getDocumentById,
  uploadDocument,
  getDocumentFile,
  deleteDocument,
};

