import { formatMessageTime } from '../../utils/formatTime.js';

export default function MessageBubble({ message, isOwn }) {
  return (
    <div className={`message-row ${isOwn ? 'own' : ''} ${message._justArrived ? 'just-arrived' : ''}`}>
      <div className="message-bubble">
        <p className="message-content">{message.content}</p>
        <span className="message-time">{formatMessageTime(message.createdAt)}</span>
      </div>
    </div>
  );
}
