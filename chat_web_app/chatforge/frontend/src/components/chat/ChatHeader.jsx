import Avatar from '../common/Avatar.jsx';
import SignalIndicator from '../common/SignalIndicator.jsx';
import { getConversationDisplay } from '../../utils/conversationDisplay.js';
import { formatLastSeen } from '../../utils/formatTime.js';

export default function ChatHeader({ conversation, currentUserId }) {
  const { name, isOnline, otherUser, lastSeen } = getConversationDisplay(conversation, currentUserId);

  return (
    <header className="chat-header">
      <div className="chat-header-avatar">
        <Avatar username={otherUser?.username || name} size={40} />
        {conversation.type === 'direct' && <SignalIndicator online={isOnline} />}
      </div>
      <div>
        <h2 className="chat-header-name">{name}</h2>
        <p className="chat-header-status">
          {conversation.type === 'group'
            ? `${conversation.participants.length} members`
            : isOnline
            ? 'Online'
            : lastSeen
            ? `Last seen ${formatLastSeen(lastSeen)}`
            : 'Offline'}
        </p>
      </div>
    </header>
  );
}
