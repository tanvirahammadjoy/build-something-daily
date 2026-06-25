const mongoose = require('mongoose');

// A single checklist item inside a task
const subtaskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    completed: { type: Boolean, default: false },
  },
  { _id: true, timestamps: false }
);

// File attached to a task (populated by Cloudinary uploads in Phase 4)
const attachmentSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    // Cloudinary buckets uploads as 'image' | 'video' | 'raw' depending on
    // file type (when uploaded with resource_type: 'auto'). Deleting an
    // attachment later requires passing the SAME resource_type back to
    // Cloudinary, so we have to remember it at upload time.
    resourceType: { type: String, default: 'image' },
    fileName: { type: String, required: true },
    fileType: { type: String, default: '' },
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

// Recurrence rule for repeating tasks (consumed by the Phase 4 scheduler)
const recurrenceSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['none', 'daily', 'weekly', 'monthly', 'custom'],
      default: 'none',
    },
    interval: { type: Number, default: 1, min: 1 }, // every N days/weeks/months
    daysOfWeek: { type: [Number], default: [] }, // 0=Sun .. 6=Sat, for weekly/custom
    endDate: { type: Date, default: null },
  },
  { _id: false }
);

const taskSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: '',
    },
    completed: {
      type: Boolean,
      default: false,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    category: {
      type: String,
      trim: true,
      default: 'General',
    },
    tags: {
      type: [String],
      default: [],
    },
    dueDate: {
      type: Date,
      default: null,
      index: true,
    },
    subtasks: {
      type: [subtaskSchema],
      default: [],
    },
    attachments: {
      type: [attachmentSchema],
      default: [],
    },
    recurrence: {
      type: recurrenceSchema,
      default: () => ({}),
    },
    // True if this task was auto-generated from a recurring parent
    isRecurringInstance: {
      type: Boolean,
      default: false,
    },
    parentTask: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
      default: null,
    },
    // Manual ordering, e.g. for drag-and-drop reordering in the UI
    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Common query patterns: a user's open tasks, and a user's tasks by due date (calendar view)
taskSchema.index({ user: 1, completed: 1 });
taskSchema.index({ user: 1, dueDate: 1 });

module.exports = mongoose.model('Task', taskSchema);
