export function getConversationDisplay(conversation, currentUserId) {
  if (conversation.type === 'group') {
    return {
      name: conversation.groupName || 'Group chat',
      isOnline: false, // presence isn't a single boolean for a group
      otherUser: null,
    };
  }

  const other =
    conversation.participants.find((p) => p._id !== currentUserId) || conversation.participants[0];

  return {
    name: other?.username || 'Unknown user',
    isOnline: other?.isOnline,
    lastSeen: other?.lastSeen,
    otherUser: other,
  };
}
