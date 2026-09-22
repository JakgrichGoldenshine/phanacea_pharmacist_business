import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { LifeBuoy, Plus, MessagesSquare } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Spinner from '../components/ui/Spinner';
import { supportApi } from '../api/supportApi';
import { TICKET_CATEGORY_LABELS, ticketStatusMeta } from '../utils/ticketStatus';

const CATEGORY_LABELS = TICKET_CATEGORY_LABELS;

export default function Support() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ subject: '', category: 'general', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    supportApi
      .list()
      .then((res) => setTickets(res.data))
      .catch(() => setTickets([]))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await supportApi.create(form);
      setForm({ subject: '', category: 'general', message: '' });
      setShowForm(false);
      load();
    } catch (err) {
      setError(err.message || 'ส่งคำร้องไม่สำเร็จ');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-5 py-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-ink">ศูนย์ช่วยเหลือ</h1>
          <p className="mt-1 text-subtle">แจ้งปัญหา สอบถาม หรือให้ข้อเสนอแนะกับทีมงาน</p>
        </div>
        <Button onClick={() => setShowForm((v) => !v)} className="px-5 py-2.5 text-sm">
          <Plus size={16} /> ส่งคำร้องใหม่
        </Button>
      </div>

      {/* A ticket is for something that needs tracking; most questions are
          faster answered in the live chat, so point at it up front. */}
      <Link to="/chat" className="mt-6 block">
        <Card className="flex items-center gap-4 p-5 transition hover:border-cyan/40">
          <span className="icon-chip h-11 w-11">
            <MessagesSquare size={20} />
          </span>
          <div>
            <p className="font-medium text-ink">อยากได้คำตอบเร็วกว่านี้?</p>
            <p className="text-sm text-subtle">แชทกับทีมงานโดยตรง ตอบกลับภายในเวลาทำการ</p>
          </div>
        </Card>
      </Link>

      {showForm && (
        <Card className="mt-6 p-6">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="mb-1.5 block text-sm text-subtle">หัวข้อ</label>
              <input className="field" name="subject" required value={form.subject} onChange={handleChange} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm text-subtle">ประเภท</label>
              <select className="field" name="category" value={form.category} onChange={handleChange}>
                {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm text-subtle">รายละเอียด</label>
              <textarea
                className="field min-h-[120px]"
                name="message"
                required
                value={form.message}
                onChange={handleChange}
              />
            </div>
            {error && <p className="text-sm text-rose-500">{error}</p>}
            <Button disabled={submitting}>{submitting ? 'กำลังส่ง...' : 'ส่งคำร้อง'}</Button>
          </form>
        </Card>
      )}

      <div className="mt-8">
        {loading ? (
          <Spinner />
        ) : tickets.length === 0 ? (
          <div className="py-16 text-center">
            <span className="icon-chip mx-auto h-16 w-16">
              <LifeBuoy size={26} />
            </span>
            <p className="mt-4 text-subtle">คุณยังไม่เคยส่งคำร้อง</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tickets.map((t) => {
              const meta = ticketStatusMeta(t.status);
              return (
                <Link key={t.id} to={`/support/${t.id}`}>
                  <Card className="flex items-center justify-between gap-4 p-5">
                    <div>
                      <p className="font-medium text-ink">{t.subject}</p>
                      <p className="text-xs text-faint">
                        {CATEGORY_LABELS[t.category]} · {new Date(t.created_at).toLocaleDateString('th-TH')}
                      </p>
                    </div>
                    <Badge tone={meta.tone}>{meta.label}</Badge>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
