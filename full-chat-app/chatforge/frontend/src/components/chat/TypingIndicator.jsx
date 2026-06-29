export default function TypingIndicator({ typingUsers }) {
  if (!typingUsers || typingUsers.length === 0) return null;

  const label =
    typingUsers.length === 1
      ? `${typingUsers[0].username} is typing`
      : `${typingUsers.map((u) => u.username).join(', ')} are typing`;

  return (
    <div className="typing-indicator" aria-live="polite">
      <span className="typing-bars">
        <span className="typing-bar" />
        <span className="typing-bar" />
        <span className="typing-bar" />
      </span>
      <span className="typing-label">{label}</span>
    </div>
  );
}
