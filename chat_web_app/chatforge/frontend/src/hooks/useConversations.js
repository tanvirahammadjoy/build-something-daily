import { useCallback, useEffect, useState } from 'react';
import { fetchConversations } from '../api/conversationApi.js';
import { useSocket } from '../context/SocketContext.jsx';

export function useConversations() {
  const { socket } = useSocket();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    fetchConversations()
      .then((data) => setConversations(data.conversations))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Keep the sidebar's previews + ordering live as messages/presence change anywhere
  useEffect(() => {
    if (!socket) return;

    const handleConversationUpdated = ({ conversationId, lastMessage }) => {
      setConversations((prev) => {
        const updated = prev.map((c) =>
          c._id === conversationId ? { ...c, lastMessage, updatedAt: lastMessage.createdAt } : c
        );
        // Float the most recently active conversation to the top
        return [...updated].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
      });
    };

    const applyPresence = (userId, isOnline, lastSeen) => {
      setConversations((prev) =>
        prev.map((c) => ({
          ...c,
          participants: c.participants.map((p) =>
            p._id === userId ? { ...p, isOnline, lastSeen: lastSeen || p.lastSeen } : p
          ),
        }))
      );
    };

    const onOnline = ({ userId }) => applyPresence(userId, true);
    const onOffline = ({ userId, lastSeen }) => applyPresence(userId, false, lastSeen);

    socket.on('conversation_updated', handleConversationUpdated);
    socket.on('user_online', onOnline);
    socket.on('user_offline', onOffline);

    return () => {
      socket.off('conversation_updated', handleConversationUpdated);
      socket.off('user_online', onOnline);
      socket.off('user_offline', onOffline);
    };
  }, [socket]);

  const addConversation = (conversation) => {
    setConversations((prev) => {
      if (prev.some((c) => c._id === conversation._id)) return prev;
      return [conversation, ...prev];
    });
  };

  return { conversations, loading, refresh, addConversation };
}
