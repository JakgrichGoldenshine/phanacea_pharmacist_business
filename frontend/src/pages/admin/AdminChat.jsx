import React, { useCallback, useEffect, useRef, useState } from 'react';
import { MessageSquare, CircleDot } from 'lucide-react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import ChatThread from '../../components/ChatThread';
import { adminApi } from '../../api/adminApi';
import { usePolling } from '../../hooks/usePolling';
import { useAdminAuth } from '../../hooks/useAdminAuth';
import { ticketStatusMeta } from '../../utils/ticketStatus';

const LIST_POLL_MS = 8000;
const THREAD_POLL_MS = 4000;
const CLOSE_ALLOWED_ROLES = ['owner', 'pharmacist', 'assistant'];

// Two-pane live-chat console: conversations on the left, the selected
// thread on the right. Both panes poll, at different rates — the inbox
// changes far less often than an open conversation.
export default function AdminChat() {
  const { staff } = useAdminAuth();
  const [conversations, setConversations] = useState([]);
  const [filter, setFilter] = useState('active');
  const [activeId, setActiveId] = useState(null);
  const [thread, setThread] = useState({ conversation: null, messages: [] });
  const [loadingList, setLoadingList] = useState(true);
  const [loadingThread, setLoadingThread] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const lastIdRef = useRef(null);
  const canClose = CLOSE_ALLOWED_ROLES.includes(staff?.role);

  const loadList = useCallback(
    async (statusFilter) => {
      const res = await adminApi.listChats({ status: statusFilter, limit: 50 });
      setConversations(res.items);
      return res.items;
    },
    []
  );

  useEffect(() => {
    let cancelled = false;
    setLoadingList(true);
    loadList(filter)
      .then((items) => {
        // Open the conversation that has been waiting longest for a reply,
        // so a staff member landing here starts where they are needed.
        if (cancelled) return;
        setActiveId((current) => current ?? items.find((c) => c.unread)?.id ?? items[0]?.id ?? null);
      })
      .catch((err) => !cancelled && setError(err.message))
      .finally(() => !cancelled && setLoadingList(false));
    return () => {
      cancelled = true;
    };
  }, [filter, loadList]);

  usePolling(() => loadList(filter).catch(() => {}), LIST_POLL_MS, !loadingList);

  const loadThread = useCallback(async (id, { incremental } = {}) => {
    const after = incremental ? lastIdRef.current : null;
    const res = await adminApi.getChat(id, after);
    const { conversation, messages } = res.data;

    if (messages.length > 0) lastIdRef.current = messages[messages.length - 1].id;

    setThread((prev) => ({
      conversation,
      messages: incremental ? [...prev.messages, ...messages] : messages,
    }));
  }, []);

  useEffect(() => {
    if (!activeId) {
      setThread({ conversation: null, messages: [] });
      return undefined;
    }

    let cancelled = false;
    lastIdRef.current = null;
    setLoadingThread(true);
    loadThread(activeId)
      .catch((err) => !cancelled && setError(err.message))
      .finally(() => !cancelled && setLoadingThread(false));

    return () => {
      cancelled = true;
    };
  }, [activeId, loadThread]);

  usePolling(
    () => (activeId ? loadThread(activeId, { incremental: true }).catch(() => {}) : Promise.resolve()),
    THREAD_POLL_MS,
    Boolean(activeId) && !loadingThread
  );

  const handleSend = async (message) => {
    setError('');
    setSending(true);
    try {
      await adminApi.sendChatMessage(activeId, message);
      await loadThread(activeId, { incremental: true });
      await loadList(filter);
    } catch (err) {
      setError(err.message || 'ส่งข้อความไม่สำเร็จ');
      throw err;
    } finally {
      setSending(false);
    }
  };

  const handleStatus = async (status) => {
    setError('');
    try {
      await adminApi.updateChatStatus(activeId, status);
      await Promise.all([loadThread(activeId), loadList(filter)]);
    } catch (err) {
      setError(err.message || 'อัปเดตสถานะไม่สำเร็จ');
    }
  };

  const active = thread.conversation;
  const bubbles = thread.messages.map((m) => ({ ...m, senderName: m.staff?.full_name }));

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">แชทสดกับลูกค้า</h1>
          <p className="mt-1 text-subtle">ตอบคำถามลูกค้าแบบเรียลไทม์</p>
        </div>
        <select className="field w-auto" value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="active">กำลังสนทนา</option>
          <option value="resolved">แก้ไขแล้ว</option>
          <option value="closed">ปิดแล้ว</option>
          <option value="">ทั้งหมด</option>
        </select>
      </div>

      {error && (
        <p role="alert" className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm text-rose-600">
          {error}
        </p>
      )}

      <div className="mt-6 grid gap-5 lg:grid-cols-[320px_1fr]">
        {/* Conversation list */}
        <Card className="p-0">
          {loadingList ? (
            <Spinner />
          ) : conversations.length === 0 ? (
            <p className="px-5 py-12 text-center text-sm text-subtle">ยังไม่มีห้องแชทในหมวดนี้</p>
          ) : (
            <ul className="max-h-[70vh] divide-y divide-line overflow-y-auto">
              {conversations.map((c) => (
                <li key={c.id}>
                  <button
                    onClick={() => setActiveId(c.id)}
                    className={`flex w-full items-start gap-3 px-4 py-3 text-left transition ${
                      activeId === c.id ? 'bg-cyan/10' : 'hover:bg-panelLight'
                    }`}
                  >
                    <span className="mt-1 shrink-0">
                      {c.unread ? (
                        <CircleDot size={14} className="text-cyan" />
                      ) : (
                        <MessageSquare size={14} className="text-faint" />
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className={`block truncate text-sm ${c.unread ? 'font-bold text-ink' : 'text-ink'}`}>
                        {c.user?.full_name || c.user?.email || `ลูกค้า #${c.id}`}
                      </span>
                      <span className="block truncate text-xs text-faint">
                        {new Date(c.last_message_at).toLocaleString('th-TH')}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Thread */}
        <Card className="p-6">
          {!activeId ? (
            <p className="py-20 text-center text-sm text-subtle">เลือกห้องแชททางซ้ายเพื่อเริ่มตอบลูกค้า</p>
          ) : loadingThread ? (
            <Spinner />
          ) : (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
                <div>
                  <p className="font-display font-semibold text-ink">{active?.user?.full_name}</p>
                  <p className="text-xs text-faint">
                    {active?.user?.email}
                    {active?.user?.phone_number ? ` · ${active.user.phone_number}` : ''}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge tone={ticketStatusMeta(active?.status).tone}>{ticketStatusMeta(active?.status).label}</Badge>
                  {canClose && (
                    <select
                      className="field w-auto py-1.5 text-xs"
                      value={active?.status || 'open'}
                      onChange={(e) => handleStatus(e.target.value)}
                    >
                      <option value="open">รอตอบกลับ</option>
                      <option value="in_progress">กำลังดำเนินการ</option>
                      <option value="resolved">แก้ไขแล้ว</option>
                      <option value="closed">ปิดห้องแชท</option>
                    </select>
                  )}
                </div>
              </div>

              <div className="mt-4">
                <ChatThread
                  bubbles={bubbles}
                  viewerType="staff"
                  onSend={handleSend}
                  sending={sending}
                  disabled={active?.status === 'closed'}
                  placeholder={
                    active?.status === 'closed' ? 'ห้องแชทนี้ถูกปิดแล้ว' : 'พิมพ์คำตอบถึงลูกค้า...'
                  }
                  threadClassName="max-h-[52vh] overflow-y-auto pr-1"
                  emptyLabel="ยังไม่มีข้อความในห้องแชทนี้"
                />
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
