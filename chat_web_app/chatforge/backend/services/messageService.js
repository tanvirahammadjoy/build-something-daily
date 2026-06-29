const Message = require('../models/Message');
const Conversation = require('../models/Conversation');

/**
 * Creates a message, marks it read by its own sender, and bumps the parent
 * conversation's lastMessage + updatedAt (so the sidebar re-sorts to the top).
 * Pulled out into a service so both the REST endpoint and the Socket.io
 * handler (Phase 4) can create messages through one code path.
 */
const createMessage = async ({ conversationId, senderId, content }) => {
  const message = await Message.create({
    conversation: conversationId,
    sender: senderId,
    content,
    readBy: [senderId],
  });

  const conversation = await Conversation.findById(conversationId);
  conversation.lastMessage = message._id;
  await conversation.save(); // timestamps:true means this also bumps updatedAt

  // Re-fetch with sender populated so callers get a ready-to-render object.
  return Message.findById(message._id).populate('sender', 'username avatar');
};

module.exports = { createMessage };
