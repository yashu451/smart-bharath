const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    deptId: {
      type: String,
      required: true,
      trim: true,
    },
    deptName: {
      type: String,
      required: true,
      trim: true,
    },
    service: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    state: {
      type: String,
      default: 'ALL',
      trim: true,
    },
    stateName: {
      type: String,
      default: '',
      trim: true,
    },
    district: {
      type: String,
      default: '',
      trim: true,
    },
    date: {
      type: String,
      required: true,
      trim: true,
    },
    time: {
      type: String,
      required: true,
      trim: true,
    },
    purpose: {
      type: String,
      default: '',
      trim: true,
    },
    bookingId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    token: {
      type: String,
      trim: true,
    },
    verificationToken: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    verificationUrl: {
      type: String,
      default: '',
    },
    qrCodeDataUrl: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ['Upcoming', 'Completed', 'Cancelled', 'Overdue'],
      default: 'Upcoming',
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
      default: '🛂',
    },
    isCancelled: {
      type: Boolean,
      default: false,
    },
    disclaimer: {
      type: String,
      default: 'Smart Bharat Internal Appointment Verification (Not Official Government Verification)',
    },
  },
  {
    timestamps: true,
  }
);

appointmentSchema.index({ userId: 1, date: 1 });

module.exports = mongoose.model('Appointment', appointmentSchema);

