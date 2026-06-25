const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
      default: null,
    },
    type: {
      type: String,
      enum: ['due_soon', 'overdue', 'recurring_created', 'system'],
      required: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    // Where this notification was/should be delivered.
    // 'in_app' ones get pushed live over Socket.io in Phase 6.
    channel: {
      type: String,
      enum: ['in_app', 'email'],
      default: 'in_app',
    },
    read: {
      type: Boolean,
      default: false,
    },
    sentAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

notificationSchema.index({ user: 1, read: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
