import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import { adminApi } from '../../api/adminApi';
import { TICKET_STATUSES, TICKET_CATEGORY_LABELS, ticketStatusMeta } from '../../utils/ticketStatus';

export default function AdminSupport() {
  const [tickets, setTickets] = useState([]);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    adminApi
      .listTickets({ limit: 50, status: status || undefined })
      .then((res) => setTickets(res.items))
      .finally(() => setLoading(false));
  }, [status]);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">ข้อความติดต่อ / คำร้อง</h1>
          <p className="mt-1 text-subtle">คำร้องและข้อเสนอแนะจากลูกค้า</p>
        </div>
        <select className="field w-auto" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">ทุกสถานะ</option>
          {TICKET_STATUSES.map((s) => (
            <option key={s} value={s}>
              {ticketStatusMeta(s).label}
            </option>
          ))}
        </select>
      </div>

      <Card className="mt-6 overflow-x-auto p-0">
        {loading ? (
          <Spinner />
        ) : (
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-line text-xs uppercase tracking-wide text-faint">
                <th className="px-5 py-3">หัวข้อ</th>
                <th className="px-5 py-3">ลูกค้า</th>
                <th className="px-5 py-3">ประเภท</th>
                <th className="px-5 py-3">สถานะ</th>
                <th className="px-5 py-3">วันที่</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((t) => {
                const meta = ticketStatusMeta(t.status);
                return (
                  <tr key={t.id} className="border-b border-line/60 last:border-0">
                    <td className="px-5 py-3">
                      <Link to={`/admin/support/${t.id}`} className="font-medium text-cyan hover:underline">
                        {t.subject}
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-subtle">{t.user?.full_name || t.user?.email}</td>
                    <td className="px-5 py-3 text-subtle">{TICKET_CATEGORY_LABELS[t.category]}</td>
                    <td className="px-5 py-3">
                      <Badge tone={meta.tone}>{meta.label}</Badge>
                    </td>
                    <td className="px-5 py-3 text-subtle">{new Date(t.created_at).toLocaleDateString('th-TH')}</td>
                  </tr>
                );
              })}
              {tickets.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-subtle">
                    ไม่มีคำร้องในขณะนี้
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
