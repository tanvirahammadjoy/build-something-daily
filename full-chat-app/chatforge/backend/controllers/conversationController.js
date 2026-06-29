const Conversation = require('../models/Conversation');
const User = require('../models/User');

// POST /api/conversations
// body: { type: 'direct' | 'group', participantIds: [...], groupName? }
const createConversation = async (req, res) => {
  try {
    const { type, participantIds = [], groupName } = req.body;
    const myId = req.user._id;

    if (!['direct', 'group'].includes(type)) {
      return res.status(400).json({ message: "type must be 'direct' or 'group'" });
    }
    if (!Array.isArray(participantIds) || participantIds.length === 0) {
      return res.status(400).json({ message: 'At least one other participant is required' });
    }

    // Always include the creator, and dedupe in case the client sent themselves too
    const allParticipantIds = [...new Set([myId.toString(), ...participantIds.map(String)])];

    if (type === 'direct') {
      if (allParticipantIds.length !== 2) {
        return res.status(400).json({ message: 'Direct conversations must have exactly 2 participants' });
      }

      // Reuse an existing direct conversation between these two users instead
      // of creating a duplicate every time someone clicks "message" on the same person.
      const existing = await Conversation.findOne({
        type: 'direct',
        participants: { $all: allParticipantIds, $size: 2 },
      }).populate('participants', 'username avatar isOnline lastSeen');

      if (existing) {
        return res.status(200).json({ conversation: existing });
      }
    } else {
      if (allParticipantIds.length < 3) {
        return res.status(400).json({ message: 'Group conversations need at least 3 participants total' });
      }
      if (!groupName?.trim()) {
        return res.status(400).json({ message: 'groupName is required for group conversations' });
      }
    }

    // Verify every participant ID corresponds to a real user before creating
    const users = await User.find({ _id: { $in: allParticipantIds } });
    if (users.length !== allParticipantIds.length) {
      return res.status(400).json({ message: 'One or more participant IDs are invalid' });
    }

    const conversation = await Conversation.create({
      type,
      participants: allParticipantIds,
      groupName: type === 'group' ? groupName.trim() : undefined,
      createdBy: myId,
    });

    const populated = await conversation.populate('participants', 'username avatar isOnline lastSeen');

    res.status(201).json({ conversation: populated });
  } catch (error) {
    res.status(500).json({ message: 'Server error creating conversation', error: error.message });
  }
};

// GET /api/conversations - every conversation the logged-in user belongs to,
// most recently active first (drives the sidebar)
const getMyConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({ participants: req.user._id })
      .populate('participants', 'username avatar isOnline lastSeen')
      .populate('lastMessage')
      .sort({ updatedAt: -1 });

    res.json({ conversations });
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching conversations', error: error.message });
  }
};

module.exports = { createConversation, getMyConversations };
