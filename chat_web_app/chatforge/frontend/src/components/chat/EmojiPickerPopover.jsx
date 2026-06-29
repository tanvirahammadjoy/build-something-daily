import { useEffect, useRef } from 'react';
import EmojiPicker, { EmojiStyle, Theme } from 'emoji-picker-react';

export default function EmojiPickerPopover({ onSelect, onClose }) {
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  return (
    <div className="emoji-popover" ref={ref}>
      <EmojiPicker
        theme={Theme.DARK}
        emojiStyle={EmojiStyle.NATIVE}
        onEmojiClick={(emojiData) => onSelect(emojiData.emoji)}
        width={320}
        height={380}
        skinTonesDisabled
        previewConfig={{ showPreview: false }}
      />
    </div>
  );
}
