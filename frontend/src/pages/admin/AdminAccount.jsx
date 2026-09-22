import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { KeyRound } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { adminApi } from '../../api/adminApi';
import { useAdminAuth } from '../../hooks/useAdminAuth';

// Self-service password change, open to EVERY staff role — unlike
// /admin/staff, which is owner-only because it manages other people's
// access. Guarded by the current password rather than by role.
export default function AdminAccount() {
  const { staff, logout } = useAdminAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ current_password: '', new_password: '', confirm_password: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.new_password !== form.confirm_password) {
      setError('รหัสผ่านใหม่และการยืนยันไม่ตรงกัน');
      return;
    }

    setSubmitting(true);
    try {
      await adminApi.changeOwnPassword({
        current_password: form.current_password,
        new_password: form.new_password,
      });
      // The server revokes every session on a password change, including
      // this one, so signing out here matches what actually happened
      // instead of leaving a token that fails the next request.
      await logout();
      navigate('/login', { replace: true });
    } catch (err) {
      setError(err.message || 'เปลี่ยนรหัสผ่านไม่สำเร็จ');
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="font-display text-2xl font-bold text-ink">บัญชีของฉัน</h1>
      <p className="mt-1 text-subtle">
        {staff?.full_name} · {staff?.username}
      </p>

      <Card className="mt-6 p-6">
        <h2 className="flex items-center gap-2 font-display font-semibold text-ink">
          <KeyRound size={18} className="text-subtle" /> เปลี่ยนรหัสผ่าน
        </h2>

        <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="mb-1.5 block text-sm text-subtle">รหัสผ่านปัจจุบัน</label>
            <input
              className="field"
              type="password"
              name="current_password"
              required
              autoComplete="current-password"
              value={form.current_password}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm text-subtle">รหัสผ่านใหม่</label>
            <input
              className="field"
              type="password"
              name="new_password"
              required
              autoComplete="new-password"
              placeholder="อย่างน้อย 8 ตัว มีตัวอักษร+ตัวเลข"
              value={form.new_password}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm text-subtle">ยืนยันรหัสผ่านใหม่</label>
            <input
              className="field"
              type="password"
              name="confirm_password"
              required
              autoComplete="new-password"
              value={form.confirm_password}
              onChange={handleChange}
            />
          </div>

          {error && (
            <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm text-rose-600">
              {error}
            </p>
          )}

          <Button className="w-full py-3" disabled={submitting}>
            {submitting ? 'กำลังบันทึก...' : 'เปลี่ยนรหัสผ่าน'}
          </Button>
          <p className="text-xs text-faint">หลังเปลี่ยนรหัสผ่าน ระบบจะออกจากระบบทุกอุปกรณ์เพื่อความปลอดภัย</p>
        </form>
      </Card>
    </div>
  );
}
