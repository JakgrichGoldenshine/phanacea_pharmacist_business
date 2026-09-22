import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useAuth } from '../hooks/useAuth';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '', full_name: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await register(form);
      navigate('/login');
    } catch (err) {
      setError(err.message || 'สมัครสมาชิกไม่สำเร็จ');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md items-center px-5 py-16">
      <Card className="w-full p-8">
        <h1 className="font-display text-2xl font-bold text-ink">สมัครสมาชิก</h1>
        <p className="mt-1 text-sm text-subtle">สร้างบัญชีเพื่อสั่งซื้อและติดตามคำสั่งซื้อของคุณ</p>

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="mb-1.5 block text-sm text-subtle">ชื่อ-นามสกุล</label>
            <input className="field" name="full_name" required value={form.full_name} onChange={handleChange} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm text-subtle">ชื่อผู้ใช้</label>
            <input className="field" name="username" required value={form.username} onChange={handleChange} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm text-subtle">อีเมล</label>
            <input className="field" type="email" name="email" required value={form.email} onChange={handleChange} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm text-subtle">รหัสผ่าน (อย่างน้อย 8 ตัวอักษร)</label>
            <input
              className="field"
              type="password"
              name="password"
              minLength={8}
              required
              value={form.password}
              onChange={handleChange}
            />
          </div>

          {error && (
            <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm text-rose-600">
              {error}
            </p>
          )}

          <Button className="w-full py-3.5" disabled={submitting}>
            {submitting ? 'กำลังสมัครสมาชิก...' : 'สมัครสมาชิก'}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-subtle">
          มีบัญชีอยู่แล้ว?{' '}
          <Link to="/login" className="text-cyan hover:underline">
            เข้าสู่ระบบ
          </Link>
        </p>
      </Card>
    </div>
  );
}
