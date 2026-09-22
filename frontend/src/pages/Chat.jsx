import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Headset, ShieldCheck } from 'lucide-react';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Spinner from '../components/ui/Spinner';
import ChatThread from '../components/ChatThread';
import { chatApi } from '../api/chatApi';
import { usePolling } from '../hooks/usePolling';
import { useAuth } from '../hooks/useAuth';

const POLL_INTERVAL_MS = 4000;

// Direct line to the pharmacy. Unlike the ticket centre (subject +
// category + a case to resolve) this is one continuous conversation the
// customer can simply start typing into.
export default function Chat() {
  const { user } = useAuth();
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  // The id of the newest message already on screen. Kept in a ref so the
  // polling callback always reads the current value without having to be
  // rebuilt (and the interval restarted) on every message.
  const lastIdRef = useRef(null);

  // Which conversation the messages on screen belong to. If staff close a
  // chat, the next message starts a NEW conversation — without this the
  // old thread would stay visible above the new one.
  const conversationIdRef = useRef(null);

  const refresh = useCallback(async () => {
    // Captured before the request: it decides whether the response is the
    // whole thread or just the messages added since the last poll.
    const isIncremental = lastIdRef.current !== null;

    const res = await chatApi.get(lastIdRef.current);
    const { conversation: conv, messages: incoming } = res.data;

    setConversation(conv);

    if (!conv) {
      lastIdRef.current = null;
      conversationIdRef.current = null;
      setMessages([]);
      return;
    }

    const switched = conversationIdRef.current !== null && conversationIdRef.current !== conv.id;
    conversationIdRef.current = conv.id;

    if (switched) {
      lastIdRef.current = null;
      setMessages([]);
      // Re-fetch from the start of the new conversation on the next tick.
      return;
    }

    if (incoming.length > 0) {
      lastIdRef.current = incoming[incoming.length - 1].id;
      setMessages((prev) => (isIncremental ? [...prev, ...incoming] : incoming));
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    refresh()
      .catch((err) => {
        if (!cancelled) setError(err.message || 'โหลดห้องแชทไม่สำเร็จ');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [refresh]);

  // Quietly swallow polling failures: a dropped poll is not worth an error
  // banner, and the next tick will recover.
  usePolling(() => refresh().catch(() => {}), POLL_INTERVAL_MS, !loading);

  const handleSend = async (message) => {
    setError('');
    setSending(true);

    const tempId = `pending-${Date.now()}`;
    setPending([{ id: tempId, sender_type: 'user', message, created_at: new Date().toISOString(), pending: true }]);

    try {
      await chatApi.send(message);
      await refresh();
      setPending([]);
    } catch (err) {
      setPending([]);
      setError(err.message || 'ส่งข้อความไม่สำเร็จ');
      throw err; // ChatThread restores the text box so nothing is lost
    } finally {
      setSending(false);
    }
  };

  if (loading) return <Spinner label="กำลังเปิดห้องแชท..." />;

  const bubbles = [
    ...messages.map((m) => ({ ...m, senderName: m.staff?.full_name || 'ทีมงาน Phanacea' })),
    ...pending,
  ];

  return (
    <div className="mx-auto max-w-2xl px-5 py-12">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="icon-chip h-12 w-12">
            <Headset size={22} />
          </span>
          <div>
            <h1 className="font-display text-2xl font-bold text-ink">แชทกับทีมงาน</h1>
            <p className="text-sm text-subtle">คุยกับเภสัชกรและทีมดูแลลูกค้าได้โดยตรง</p>
          </div>
        </div>
        {conversation && <Badge tone="ok">กำลังสนทนา</Badge>}
      </div>

      <Card className="mt-6 p-6">
        <ChatThread
          bubbles={bubbles}
          viewerType="user"
          onSend={handleSend}
          sending={sending}
          placeholder="พิมพ์ข้อความถึงทีมงาน..."
          threadClassName="max-h-[55vh] overflow-y-auto pr-1"
          emptyLabel={`สวัสดีคุณ${user?.full_name?.split(' ')[0] || ''} — พิมพ์คำถามได้เลย ทีมงานจะตอบกลับโดยเร็วที่สุด`}
        />
        {error && (
          <p role="alert" className="mt-3 text-sm text-rose-500">
            {error}
          </p>
        )}
      </Card>

      <div className="mt-4 flex items-start gap-2 text-xs text-faint">
        <ShieldCheck size={14} className="mt-0.5 shrink-0" />
        <p>
          ทีมงานตอบกลับในเวลาทำการ · ข้อความนี้ไม่ใช่การวินิจฉัยทางการแพทย์ หากมีอาการฉุกเฉินกรุณาติดต่อ 1669
        </p>
      </div>
    </div>
  );
}
