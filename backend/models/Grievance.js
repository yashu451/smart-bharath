const mongoose = require('mongoose');

const grievanceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    state: {
      type: String,
      required: true,
      trim: true,
    },
    district: {
      type: String,
      default: '',
      trim: true,
    },
    city: {
      type: String,
      default: '',
      trim: true,
    },
    exactLocation: {
      type: String,
      default: '',
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    authorityName: {
      type: String,
      default: 'Designated Government Authority',
      trim: true,
    },
    portalName: {
      type: String,
      required: true,
      trim: true,
    },
    portalUrl: {
      type: String,
      required: true,
      trim: true,
    },
    trackingUrl: {
      type: String,
      default: '',
      trim: true,
    },
    referenceNumber: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    submissionDate: {
      type: Date,
      default: Date.now,
    },
    expectedTimelineDays: {
      type: Number,
      default: 30, // Official standard default under central/state citizen charter
    },
    officialTimelineNotice: {
      type: String,
      default: 'Official Citizen Charter standard timeline is 30 days.',
      trim: true,
    },
    citizenStatus: {
      type: String,
      enum: ['Awaiting Updates', 'In Review', 'Action Taken', 'Resolved by Dept', 'Closed'],
      default: 'Awaiting Updates',
    },
    notes: [
      {
        text: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    reminders: [
      {
        date: { type: Date, required: true },
        note: { type: String, default: 'Check official portal for updates' },
        isDone: { type: Boolean, default: false },
      },
    ],
    citizenFeedback: {
      rating: { type: Number, min: 1, max: 5 },
      experienceNotes: { type: String, default: '' },
      recordedAt: { type: Date },
    },
    supportingFilename: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Grievance', grievanceSchema);

