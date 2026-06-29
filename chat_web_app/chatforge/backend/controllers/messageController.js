const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const { createMessage } = require('../services/messageService');

// GET /api/messages/:conversationId?page=1&limit=30
const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 30;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }
    if (!conversation.participants.some((id) => id.equals(req.user._id))) {
      return res.status(403).json({ message: 'You are not a participant in this conversation' });
    }

    // Fetch newest-first for pagination math, then reverse so the frontend
    // can simply prepend older pages above an already-chronological list.
    const messages = await Message.find({ conversation: conversationId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('sender', 'username avatar');

    res.json({
      messages: messages.reverse(),
      page,
      hasMore: messages.length === limit,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching messages', error: error.message });
  }
};

// POST /api/messages
// REST fallback for sending a message. The primary path in the running app
// is Socket.io (Phase 4), but keeping this means the app still works -
// just without instant delivery to other tabs - if a socket connection drops.
const sendMessage = async (req, res) => {
  try {
    const { conversationId, content } = req.body;

    if (!conversationId || !content?.trim()) {
      return res.status(400).json({ message: 'conversationId and content are required' });
    }

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }
    if (!conversation.participants.some((id) => id.equals(req.user._id))) {
      return res.status(403).json({ message: 'You are not a participant in this conversation' });
    }

    const message = await createMessage({
      conversationId,
      senderId: req.user._id,
      content: content.trim(),
    });

    res.status(201).json({ message });
  } catch (error) {
    res.status(500).json({ message: 'Server error sending message', error: error.message });
  }
};

module.exports = { getMessages, sendMessage };
