import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Spinner from '../components/ui/Spinner';
import ChatThread from '../components/ChatThread';
import { supportApi } from '../api/supportApi';
import { TICKET_CATEGORY_LABELS, ticketStatusMeta } from '../utils/ticketStatus';

export default function SupportDetail() {
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const load = () =>
    supportApi
      .getById(id)
      .then((res) => setTicket(res.data))
      .catch(() => setNotFound(true));

  useEffect(() => {
    load().finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleSend = async (message) => {
    setError('');
    setSending(true);
    try {
      await supportApi.addMessage(id, message);
      await load();
    } catch (err) {
      setError(err.message || 'ส่งข้อความไม่สำเร็จ');
    } finally {
      setSending(false);
    }
  };

  if (loading) return <Spinner />;
  if (notFound || !ticket) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-24 text-center">
        <p className="text-subtle">ไม่พบคำร้องนี้</p>
        <Link to="/support" className="mt-4 inline-block text-cyan hover:underline">
          กลับไปหน้าศูนย์ช่วยเหลือ
        </Link>
      </div>
    );
  }

  const meta = ticketStatusMeta(ticket.status);

  // The opening message (ticket.message) plus every reply after it forms
  // one continuous conversation.
  const bubbles = [
    { sender_type: 'user', message: ticket.message, created_at: ticket.created_at },
    ...ticket.messages.map((m) => ({ ...m, senderName: m.staff?.full_name })),
  ];

  return (
    <div className="mx-auto max-w-2xl px-5 py-12">
      <Link to="/support" className="text-sm text-subtle hover:text-cyan">
        ← กลับไปหน้าศูนย์ช่วยเหลือ
      </Link>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-bold text-ink">{ticket.subject}</h1>
        <Badge tone={meta.tone}>{meta.label}</Badge>
      </div>
      <p className="mt-1 text-sm text-subtle">
        {TICKET_CATEGORY_LABELS[ticket.category]} · ส่งเมื่อ {new Date(ticket.created_at).toLocaleString('th-TH')}
      </p>

      <Card className="mt-6 p-6">
        <ChatThread
          bubbles={bubbles}
          viewerType="user"
          onSend={handleSend}
          sending={sending}
          placeholder="พิมพ์ข้อความถึงทีมงาน..."
        />
        {error && <p className="mt-3 text-sm text-rose-500">{error}</p>}
      </Card>
    </div>
  );
}
