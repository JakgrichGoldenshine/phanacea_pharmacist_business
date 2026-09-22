import React, { useEffect, useRef, useState } from 'react';
import { Send } from 'lucide-react';
import Button from './ui/Button';

const MAX_MESSAGE_LENGTH = 2000;

// Shared chat-bubble thread, used by the support ticket pages and by both
// sides of the live chat. `viewerType` is 'user' or 'staff' — whichever
// matches the *viewer* is right-aligned, so a customer sees their own
// messages on the right and staff replies on the left, and staff see the
// mirror image, without duplicating any of this rendering logic.
export default function ChatThread({
  bubbles,
  viewerType,
  onSend,
  sending,
  placeholder,
  disabled = false,
  threadClassName = '',
  emptyLabel,
}) {
  const [text, setText] = useState('');
  const bottomRef = useRef(null);
  const lastCountRef = useRef(0);

  // Follow the conversation as it grows, but don't yank the view on an
  // unchanged poll result.
  useEffect(() => {
    if (bubbles.length !== lastCountRef.current) {
      lastCountRef.current = bubbles.length;
      bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [bubbles.length]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const message = text.trim();
    if (!message || sending || disabled) return;

    // Cleared optimistically so a fast typist can keep going; onSend is
    // responsible for surfacing any failure.
    setText('');
    try {
      await onSend(message);
    } catch {
      setText(message); // put it back rather than silently losing what they wrote
    }
  };

  return (
    <div>
      <div className={`space-y-3 ${threadClassName}`}>
        {bubbles.length === 0 && emptyLabel && (
          <p className="py-10 text-center text-sm text-subtle">{emptyLabel}</p>
        )}

        {bubbles.map((b, i) => {
          const mine = b.sender_type === viewerType;
          return (
            <div key={b.id ?? `local-${i}`} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                  mine ? 'bg-cyan text-void' : 'border border-line bg-white text-ink'
                } ${b.pending ? 'opacity-60' : ''}`}
              >
                {!mine && b.senderName && (
                  <p className="mb-0.5 text-xs font-semibold opacity-70">{b.senderName}</p>
                )}
                <p className="whitespace-pre-wrap break-words">{b.message}</p>
                <p className={`mt-1 text-[10px] ${mine ? 'text-void/60' : 'text-faint'}`}>
                  {b.pending ? 'กำลังส่ง...' : new Date(b.created_at).toLocaleString('th-TH')}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSubmit} className="mt-4 flex items-center gap-2">
        <input
          className="field"
          placeholder={placeholder || 'พิมพ์ข้อความ...'}
          maxLength={MAX_MESSAGE_LENGTH}
          disabled={disabled}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <Button
          type="submit"
          disabled={sending || disabled || !text.trim()}
          className="px-4 py-3"
          aria-label="ส่งข้อความ"
        >
          <Send size={16} />
        </Button>
      </form>
    </div>
  );
}
