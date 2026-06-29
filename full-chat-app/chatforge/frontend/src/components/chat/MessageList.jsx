import { Fragment, useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble.jsx';
import TypingIndicator from './TypingIndicator.jsx';
import { isSameDay, formatDateDivider } from '../../utils/formatTime.js';

export default function MessageList({ messages, currentUserId, loading, hasMore, onLoadMore, typingUsers }) {
  const bottomRef = useRef(null);
  const containerRef = useRef(null);
  const lastIdRef = useRef(null);

  // Scroll to the newest message only when the LAST message actually changes
  // (i.e. a message was appended) - not when an older page gets prepended
  // at the top via "load more", which would otherwise also change messages.length.
  useEffect(() => {
    const lastId = messages[messages.length - 1]?._id;
    if (lastId && lastId !== lastIdRef.current) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
    lastIdRef.current = lastId;
  }, [messages]);

  // Also follow the thread down when someone starts typing, if there's anything to scroll past
  useEffect(() => {
    if (typingUsers?.length > 0) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [typingUsers]);

  const handleScroll = () => {
    if (containerRef.current?.scrollTop === 0 && hasMore && !loading) {
      onLoadMore();
    }
  };

  return (
    <div className="message-list" ref={containerRef} onScroll={handleScroll}>
      {loading && <p className="message-list-status">Loading…</p>}
      {!loading && messages.length === 0 && <p className="message-list-status">No messages yet. Say hello!</p>}

      {messages.map((msg, index) => {
        const prevMsg = messages[index - 1];
        const showDivider = !prevMsg || !isSameDay(new Date(msg.createdAt), new Date(prevMsg.createdAt));

        return (
          <Fragment key={msg._id}>
            {showDivider && (
              <div className="date-divider">
                <span>{formatDateDivider(msg.createdAt)}</span>
              </div>
            )}
            <MessageBubble message={msg} isOwn={msg.sender._id === currentUserId} />
          </Fragment>
        );
      })}

      <TypingIndicator typingUsers={typingUsers} />
      <div ref={bottomRef} />
    </div>
  );
}
