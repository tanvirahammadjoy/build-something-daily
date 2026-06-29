const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['direct', 'group'],
      required: true,
    },
    // For 'direct' conversations this is always exactly 2 users.
    // For 'group' conversations this can be 2+.
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
    ],
    // Only used when type === 'group'
    groupName: {
      type: String,
      trim: true,
      maxlength: 50,
    },
    groupAvatar: {
      type: String,
      default: '',
    },
    // Denormalized pointer to the most recent message, so the conversation
    // list (sidebar) can render previews without an extra query per row.
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message',
      default: null,
    },
    // Who created the group (used for permissions like renaming/removing members)
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

// Speeds up "find all conversations a user is part of" queries
conversationSchema.index({ participants: 1 });

module.exports = mongoose.model('Conversation', conversationSchema);
