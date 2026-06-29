import { useState } from 'react';
import Sidebar from '../components/sidebar/Sidebar.jsx';
import ChatHeader from '../components/chat/ChatHeader.jsx';
import MessageList from '../components/chat/MessageList.jsx';
import MessageInput from '../components/chat/MessageInput.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useConversations } from '../hooks/useConversations.js';
import { useMessages } from '../hooks/useMessages.js';
import { useTypingIndicator } from '../hooks/useTypingIndicator.js';

export default function ChatPage() {
  const { user } = useAuth();
  const { conversations, loading: conversationsLoading, addConversation } = useConversations();
  const [activeId, setActiveId] = useState(null);

  // Derived (not stored separately) so presence/lastMessage updates from
  // useConversations' socket listeners are reflected immediately in the header.
  const activeConversation = conversations.find((c) => c._id === activeId) || null;

  const { messages, loading: messagesLoading, hasMore, loadMore, sendMessage } = useMessages(activeId);
  const { typingUsers, notifyTyping, stopTyping } = useTypingIndicator(activeId);

  return (
    <div className="chat-page">
      <Sidebar
        conversations={conversations}
        loading={conversationsLoading}
        activeId={activeId}
        onSelect={(conv) => setActiveId(conv._id)}
        onConversationCreated={(conv) => {
          addConversation(conv);
          setActiveId(conv._id);
        }}
      />

      <main className="chat-main">
        {activeConversation ? (
          <>
            <ChatHeader conversation={activeConversation} currentUserId={user._id} />
            <MessageList
              messages={messages}
              currentUserId={user._id}
              loading={messagesLoading}
              hasMore={hasMore}
              onLoadMore={loadMore}
              typingUsers={typingUsers}
            />
            <MessageInput onSend={sendMessage} onTyping={notifyTyping} onStopTyping={stopTyping} />
          </>
        ) : (
          <div className="chat-empty-state">
            <p>Select a conversation, or start a new one.</p>
          </div>
        )}
      </main>
    </div>
  );
}
