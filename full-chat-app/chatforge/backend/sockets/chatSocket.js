const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');
const { createMessage } = require('../services/messageService');
const socketAuthMiddleware = require('../middleware/socketAuthMiddleware');

// userId -> Set of socketIds. A user can have multiple sockets open at once
// (several browser tabs, or phone + laptop) - we only treat them as fully
// "offline" once every one of their sockets has disconnected.
// NOTE: this is in-memory and per-process. Fine for a single-server app like
// this one; a multi-instance deployment would need the Redis adapter instead
// so presence state is shared across processes.
const onlineUsers = new Map();

const addOnlineSocket = (userId, socketId) => {
  if (!onlineUsers.has(userId)) onlineUsers.set(userId, new Set());
  onlineUsers.get(userId).add(socketId);
};

// Returns true if this was the user's last open socket (i.e. they're now fully offline)
const removeOnlineSocket = (userId, socketId) => {
  const sockets = onlineUsers.get(userId);
  if (!sockets) return false;
  sockets.delete(socketId);
  if (sockets.size === 0) {
    onlineUsers.delete(userId);
    return true;
  }
  return false;
};

module.exports = function registerChatSocket(io) {
  io.use(socketAuthMiddleware);

  io.on('connection', async (socket) => {
    const userId = socket.user._id.toString();
    console.log(`Socket connected: ${socket.user.username} (${socket.id})`);

    addOnlineSocket(userId, socket.id);

    // Every user joins a personal room keyed by their own id. This lets us
    // push events (presence, sidebar updates) straight to "all of this
    // user's open tabs" without tracking individual socket ids ourselves.
    socket.join(`user:${userId}`);

    // Mark online + notify anyone who shares a conversation with this user
    await User.findByIdAndUpdate(userId, { isOnline: true, lastSeen: new Date() });
    const myConversations = await Conversation.find({ participants: userId }).select('participants');
    const relatedUserIds = new Set();
    myConversations.forEach((c) => c.participants.forEach((p) => relatedUserIds.add(p.toString())));
    relatedUserIds.forEach((id) => io.to(`user:${id}`).emit('user_online', { userId }));

    // --- Join / leave a specific conversation's room ---
    socket.on('join_conversation', async (conversationId) => {
      // Verify membership before letting them into the room - otherwise anyone
      // could eavesdrop on a conversation just by sending its ID.
      const conversation = await Conversation.findById(conversationId);
      if (!conversation || !conversation.participants.some((p) => p.equals(userId))) {
        return socket.emit('error_event', { message: 'Not authorized to join this conversation' });
      }
      socket.join(`conversation:${conversationId}`);
    });

    socket.on('leave_conversation', (conversationId) => {
      socket.leave(`conversation:${conversationId}`);
    });

    // --- Sending a message (the core event-driven loop) ---
    socket.on('send_message', async ({ conversationId, content }, callback) => {
      try {
        if (!content?.trim()) return;

        const conversation = await Conversation.findById(conversationId);
        if (!conversation || !conversation.participants.some((p) => p.equals(userId))) {
          socket.emit('error_event', { message: 'Not authorized to message in this conversation' });
          return;
        }

        const message = await createMessage({
          conversationId,
          senderId: userId,
          content: content.trim(),
        });

        // Broadcast to the whole room, including the sender's own other tabs,
        // so every connected client renders the new message identically.
        io.to(`conversation:${conversationId}`).emit('new_message', { message });

        // Also nudge each participant's personal room, so the sidebar can
        // update its preview/sort order even if they're not viewing this chat.
        conversation.participants.forEach((p) => {
          io.to(`user:${p.toString()}`).emit('conversation_updated', {
            conversationId,
            lastMessage: message,
          });
        });

        if (typeof callback === 'function') callback({ success: true, message });
      } catch (error) {
        if (typeof callback === 'function') callback({ success: false, error: error.message });
      }
    });

    // --- Typing indicators ---
    socket.on('typing_start', ({ conversationId }) => {
      socket.to(`conversation:${conversationId}`).emit('typing_start', {
        conversationId,
        userId,
        username: socket.user.username,
      });
    });

    socket.on('typing_stop', ({ conversationId }) => {
      socket.to(`conversation:${conversationId}`).emit('typing_stop', { conversationId, userId });
    });

    // --- Read receipts ---
    socket.on('mark_read', async ({ conversationId, messageIds }) => {
      try {
        if (!Array.isArray(messageIds) || messageIds.length === 0) return;
        await Message.updateMany({ _id: { $in: messageIds } }, { $addToSet: { readBy: userId } });
        socket.to(`conversation:${conversationId}`).emit('messages_read', {
          conversationId,
          messageIds,
          readBy: userId,
        });
      } catch (error) {
        socket.emit('error_event', { message: 'Failed to mark messages as read' });
      }
    });

    // --- Disconnect: only flip to "offline" once their last tab closes ---
    socket.on('disconnect', async () => {
      console.log(`Socket disconnected: ${socket.user.username} (${socket.id})`);
      const wentFullyOffline = removeOnlineSocket(userId, socket.id);

      if (wentFullyOffline) {
        const lastSeen = new Date();
        await User.findByIdAndUpdate(userId, { isOnline: false, lastSeen });

        const conversations = await Conversation.find({ participants: userId }).select('participants');
        const idsToNotify = new Set();
        conversations.forEach((c) => c.participants.forEach((p) => idsToNotify.add(p.toString())));
        idsToNotify.forEach((id) => io.to(`user:${id}`).emit('user_offline', { userId, lastSeen }));
      }
    });
  });
};
