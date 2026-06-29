import { useState } from 'react';
import ConversationListItem from './ConversationListItem.jsx';
import NewChatModal from './NewChatModal.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import Avatar from '../common/Avatar.jsx';

export default function Sidebar({ conversations, loading, activeId, onSelect, onConversationCreated }) {
  const { user, logout } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-brand">
          <span className="brand-mark">»</span>ChatForge
        </div>
        <button className="icon-btn" onClick={() => setModalOpen(true)} title="Start a new chat" aria-label="Start a new chat">
          +
        </button>
      </div>

      <div className="conversation-list">
        {loading && <p className="sidebar-empty">Loading conversations…</p>}
        {!loading && conversations.length === 0 && (
          <p className="sidebar-empty">No conversations yet. Start one with the + button.</p>
        )}
        {conversations.map((conv) => (
          <ConversationListItem
            key={conv._id}
            conversation={conv}
            currentUserId={user._id}
            active={conv._id === activeId}
            onClick={() => onSelect(conv)}
          />
        ))}
      </div>

      <div className="sidebar-footer">
        <Avatar username={user.username} size={32} />
        <span className="sidebar-username">{user.username}</span>
        <button className="link-btn" onClick={logout}>
          Sign out
        </button>
      </div>

      {modalOpen && (
        <NewChatModal
          onClose={() => setModalOpen(false)}
          onCreated={(conv) => {
            onConversationCreated(conv);
            setModalOpen(false);
          }}
        />
      )}
    </aside>
  );
}
