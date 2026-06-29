import { useCallback, useEffect, useState } from 'react';
import { fetchMessages } from '../api/messageApi.js';
import { useSocket } from '../context/SocketContext.jsx';

export function useMessages(conversationId) {
  const { socket } = useSocket();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);

  // Load the first page whenever the active conversation changes
  useEffect(() => {
    if (!conversationId) {
      setMessages([]);
      return;
    }
    setLoading(true);
    setPage(1);
    fetchMessages(conversationId, 1)
      .then((data) => {
        setMessages(data.messages);
        setHasMore(data.hasMore);
      })
      .finally(() => setLoading(false));
  }, [conversationId]);

  // Join this conversation's Socket.io room and listen for live messages
  useEffect(() => {
    if (!socket || !conversationId) return;

    socket.emit('join_conversation', conversationId);

    const handleNewMessage = ({ message }) => {
      if (message.conversation !== conversationId) return;
      setMessages((prev) => [...prev, message]);
    };

    socket.on('new_message', handleNewMessage);

    return () => {
      socket.emit('leave_conversation', conversationId);
      socket.off('new_message', handleNewMessage);
    };
  }, [socket, conversationId]);

  const loadMore = useCallback(() => {
    if (!hasMore || loading) return;
    const nextPage = page + 1;
    setLoading(true);
    fetchMessages(conversationId, nextPage)
      .then((data) => {
        setMessages((prev) => [...data.messages, ...prev]);
        setHasMore(data.hasMore);
        setPage(nextPage);
      })
      .finally(() => setLoading(false));
  }, [conversationId, page, hasMore, loading]);

  const sendMessage = useCallback(
    (content) => {
      if (!socket || !content.trim()) return;
      socket.emit('send_message', { conversationId, content: content.trim() });
      // No optimistic local push - the server echoes 'new_message' back to the
      // sender's own room too, so we treat that as the single source of truth.
    },
    [socket, conversationId]
  );

  return { messages, loading, hasMore, loadMore, sendMessage };
}
