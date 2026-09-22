import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import ChatThread from '../../components/ChatThread';
import { adminApi } from '../../api/adminApi';
import { TICKET_STATUSES, TICKET_CATEGORY_LABELS, ticketStatusMeta } from '../../utils/ticketStatus';

export default function AdminSupportDetail() {
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [statusSaving, setStatusSaving] = useState(false);
  const [error, setError] = useState('');

  const load = () => adminApi.getTicket(id).then((res) => setTicket(res.data));

  useEffect(() => {
    load().finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleSend = async (message) => {
    setError('');
    setSending(true);
    try {
      await adminApi.sendTicketMessage(id, message);
      await load();
    } catch (err) {
      setError(err.message || 'ส่งข้อความไม่สำเร็จ');
    } finally {
      setSending(false);
    }
  };

  const handleStatusChange = async (status) => {
    setStatusSaving(true);
    try {
      await adminApi.updateTicketStatus(id, status);
      await load();
    } finally {
      setStatusSaving(false);
    }
  };

  if (loading) return <Spinner />;
  if (!ticket) return <p className="text-subtle">ไม่พบคำร้องนี้</p>;

  const meta = ticketStatusMeta(ticket.status);
  const bubbles = [
    { sender_type: 'user', message: ticket.message, created_at: ticket.created_at, senderName: ticket.user?.full_name },
    ...ticket.messages.map((m) => ({ ...m, senderName: m.staff?.full_name })),
  ];

  return (
    <div className="mx-auto max-w-2xl">
      <Link to="/admin/support" className="text-sm text-subtle hover:text-cyan">
        ← กลับไปหน้าข้อความติดต่อ
      </Link>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <h1 className="font-display text-2xl font-bold text-ink">{ticket.subject}</h1>
        <Badge tone={meta.tone}>{meta.label}</Badge>
      </div>
      <p className="mt-1 text-sm text-subtle">
        {ticket.user?.full_name} ({ticket.user?.email}) · {TICKET_CATEGORY_LABELS[ticket.category]}
      </p>

      <div className="mt-4 flex items-center gap-3">
        <label className="text-sm text-subtle">สถานะ:</label>
        <select
          className="field w-auto"
          value={ticket.status}
          disabled={statusSaving}
          onChange={(e) => handleStatusChange(e.target.value)}
        >
          {TICKET_STATUSES.map((s) => (
            <option key={s} value={s}>
              {ticketStatusMeta(s).label}
            </option>
          ))}
        </select>
      </div>

      <Card className="mt-4 p-6">
        <ChatThread
          bubbles={bubbles}
          viewerType="staff"
          onSend={handleSend}
          sending={sending}
          placeholder="พิมพ์คำตอบถึงลูกค้า..."
        />
        {error && <p className="mt-3 text-sm text-rose-500">{error}</p>}
      </Card>
    </div>
  );
}
