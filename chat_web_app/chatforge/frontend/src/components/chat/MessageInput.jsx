import { Suspense, lazy, useRef, useState } from 'react';

const EmojiPickerPopover = lazy(() => import('./EmojiPickerPopover.jsx'));

export default function MessageInput({ onSend, onTyping, onStopTyping }) {
  const [value, setValue] = useState('');
  const [emojiOpen, setEmojiOpen] = useState(false);
  const inputRef = useRef(null);

  const handleChange = (e) => {
    setValue(e.target.value);
    onTyping?.();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!value.trim()) return;
    onSend(value);
    setValue('');
    onStopTyping?.();
  };

  const handleEmojiSelect = (emoji) => {
    setValue((prev) => prev + emoji);
    inputRef.current?.focus();
  };

  return (
    <form className="message-input-bar" onSubmit={handleSubmit}>
      <div className="emoji-trigger-wrap">
        <button
          type="button"
          className="icon-btn emoji-trigger"
          onClick={() => setEmojiOpen((open) => !open)}
          aria-label="Add an emoji"
        >
          🙂
        </button>
        {emojiOpen && (
          <Suspense fallback={null}>
            <EmojiPickerPopover onSelect={handleEmojiSelect} onClose={() => setEmojiOpen(false)} />
          </Suspense>
        )}
      </div>

      <input
        ref={inputRef}
        type="text"
        placeholder="Type a message…"
        value={value}
        onChange={handleChange}
        autoComplete="off"
      />
      <button type="submit" className="send-btn" disabled={!value.trim()} aria-label="Send message">
        ➤
      </button>
    </form>
  );
}
