const mongoose = require('mongoose');

const savedSchemeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    schemeId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    applicationUrl: {
      type: String,
      default: '',
      trim: true,
    },
    officialWebsite: {
      type: String,
      default: '',
      trim: true,
    },
    benefits: {
      type: String,
      default: '',
      trim: true,
    },
    eligibility: {
      type: String,
      default: '',
      trim: true,
    },
    hasOnlineApplication: {
      type: Boolean,
      default: false,
    },
    savedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

savedSchemeSchema.index({ userId: 1, schemeId: 1 }, { unique: true });

module.exports = mongoose.model('SavedScheme', savedSchemeSchema);

