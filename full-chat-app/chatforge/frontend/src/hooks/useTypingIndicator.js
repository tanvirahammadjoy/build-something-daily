import { useCallback, useEffect, useRef, useState } from 'react';
import { useSocket } from '../context/SocketContext.jsx';

const STOP_DELAY = 2000; // ms of inactivity before we tell others "stopped typing"

export function useTypingIndicator(conversationId) {
  const { socket } = useSocket();
  const [typingUsers, setTypingUsers] = useState([]); // [{ userId, username }]
  const stopTimeoutRef = useRef(null);
  const isTypingRef = useRef(false);

  // Listen for other participants' typing events in this conversation, and
  // reset/announce-stop whenever we leave it (conversation switch or unmount).
  useEffect(() => {
    if (!socket || !conversationId) return;

    const handleStart = (payload) => {
      if (payload.conversationId !== conversationId) return;
      setTypingUsers((prev) =>
        prev.some((u) => u.userId === payload.userId)
          ? prev
          : [...prev, { userId: payload.userId, username: payload.username }]
      );
    };

    const handleStop = (payload) => {
      if (payload.conversationId !== conversationId) return;
      setTypingUsers((prev) => prev.filter((u) => u.userId !== payload.userId));
    };

    socket.on('typing_start', handleStart);
    socket.on('typing_stop', handleStop);

    return () => {
      socket.off('typing_start', handleStart);
      socket.off('typing_stop', handleStop);

      setTypingUsers([]);
      clearTimeout(stopTimeoutRef.current);
      if (isTypingRef.current) {
        socket.emit('typing_stop', { conversationId });
        isTypingRef.current = false;
      }
    };
  }, [socket, conversationId]);

  // Call on every keystroke. Emits 'typing_start' once per burst of typing,
  // then auto-emits 'typing_stop' after a pause - callers don't manage timers.
  const notifyTyping = useCallback(() => {
    if (!socket || !conversationId) return;

    if (!isTypingRef.current) {
      isTypingRef.current = true;
      socket.emit('typing_start', { conversationId });
    }

    clearTimeout(stopTimeoutRef.current);
    stopTimeoutRef.current = setTimeout(() => {
      isTypingRef.current = false;
      socket.emit('typing_stop', { conversationId });
    }, STOP_DELAY);
  }, [socket, conversationId]);

  // Call right after sending - no need to wait out the pause delay once sent.
  const stopTyping = useCallback(() => {
    if (!socket || !conversationId) return;
    clearTimeout(stopTimeoutRef.current);
    if (isTypingRef.current) {
      isTypingRef.current = false;
      socket.emit('typing_stop', { conversationId });
    }
  }, [socket, conversationId]);

  return { typingUsers, notifyTyping, stopTyping };
}
