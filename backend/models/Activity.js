const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['appointment', 'grievance', 'scheme', 'document', 'assistant', 'service', 'other'],
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    subtitle: {
      type: String,
      trim: true,
    },
    token: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      default: 'In Progress',
    },
    statusColor: {
      type: String,
      default: '#000080',
    },
    statusBg: {
      type: String,
      default: '#EEF2FF',
    },
    icon: {
      type: String,
      default: '📋',
    },
    route: {
      type: String,
      default: '/home',
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Activity', activitySchema);

