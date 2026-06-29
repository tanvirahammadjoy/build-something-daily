import Avatar from '../common/Avatar.jsx';
import SignalIndicator from '../common/SignalIndicator.jsx';
import { getConversationDisplay } from '../../utils/conversationDisplay.js';
import { formatMessageTime } from '../../utils/formatTime.js';

export default function ConversationListItem({ conversation, currentUserId, active, onClick }) {
  const { name, isOnline, otherUser } = getConversationDisplay(conversation, currentUserId);
  const preview = conversation.lastMessage?.content || 'No messages yet';
  const time = conversation.lastMessage ? formatMessageTime(conversation.lastMessage.createdAt) : '';

  return (
    <button className={`conversation-item ${active ? 'active' : ''}`} onClick={onClick}>
      <div className="conversation-avatar">
        <Avatar username={otherUser?.username || name} size={44} />
        {conversation.type === 'direct' && <SignalIndicator online={isOnline} />}
      </div>
      <div className="conversation-info">
        <div className="conversation-top-row">
          <span className="conversation-name">{name}</span>
          {time && <span className="conversation-time">{time}</span>}
        </div>
        <p className="conversation-preview">{preview}</p>
      </div>
    </button>
  );
}
