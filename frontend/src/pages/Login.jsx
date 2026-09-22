import React, { useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useAuth } from '../hooks/useAuth';
import { useAdminAuth } from '../hooks/useAdminAuth';
import { authApi } from '../api/authApi';

// Presentation-only shortcut — see backend/.env.example (DEMO_LOGIN_ENABLED)
// and this file's title-tap handler below. False (the default) removes it
// from the bundle's behavior entirely: the tap handler becomes a no-op and
// the buttons never render, regardless of how the title is clicked.
const DEMO_LOGIN_ENABLED = import.meta.env.VITE_ENABLE_DEMO_LOGIN === 'true';
const DEMO_TAP_TARGET = 5;
const DEMO_TAP_RESET_MS = 1500;

// The one sign-in form for both the storefront and the admin console.
// The backend (POST /api/auth/login) checks the email against `staff`
// first, then `users`, and tells us which one matched — we just store the
// token in the right place and send the person to the matching home page.
export default function Login() {
  const { loginWithToken } = useAuth();
  const { loginWithToken: loginStaffWithToken } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [demoRevealed, setDemoRevealed] = useState(false);
  const demoTapsRef = useRef(0);
  const demoTapTimerRef = useRef(null);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  // Tap the title 5x within 1.5s of each other to reveal the demo-login
  // buttons. Only wired up at all when DEMO_LOGIN_ENABLED is true.
  const handleTitleTap = () => {
    if (!DEMO_LOGIN_ENABLED || demoRevealed) return;
    clearTimeout(demoTapTimerRef.current);
    demoTapsRef.current += 1;
    if (demoTapsRef.current >= DEMO_TAP_TARGET) {
      demoTapsRef.current = 0;
      setDemoRevealed(true);
      return;
    }
    demoTapTimerRef.current = setTimeout(() => {
      demoTapsRef.current = 0;
    }, DEMO_TAP_RESET_MS);
  };

  const handleDemoLogin = async (as) => {
    setError('');
    setSubmitting(true);
    try {
      const res = await authApi.demoLogin({ as });
      loginStaffWithToken(res.data.token, res.data.staff);
      navigate('/admin', { replace: true });
    } catch (err) {
      // 404 here means the backend doesn't have DEMO_LOGIN_ENABLED=true.
      setError(err.message || 'เข้าสู่ระบบตัวอย่างไม่สำเร็จ');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const res = await authApi.login(form);
      if (res.data.role === 'staff') {
        loginStaffWithToken(res.data.token, res.data.staff);
        // RequireAdmin stashes the page a signed-out visitor was trying to
        // reach in location.state.from; customers arrive via ?redirect=
        // instead (see RequireCustomer), so this only applies here.
        navigate(location.state?.from?.pathname || '/admin', { replace: true });
      } else {
        loginWithToken(res.data.token, res.data.user);
        navigate(params.get('redirect') || '/');
      }
    } catch (err) {
      // ครอบคลุมทั้งกรณี rate limit (429) และรหัสผ่าน/อีเมลผิด (401)
      setError(err.message || 'เข้าสู่ระบบไม่สำเร็จ');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md items-center px-5 py-16">
      <Card className="w-full p-8">
        <h1 className="font-display text-2xl font-bold text-ink" onClick={handleTitleTap}>
          เข้าสู่ระบบ
        </h1>
        <p className="mt-1 text-sm text-subtle">ยินดีต้อนรับกลับสู่ Phanacea</p>

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="mb-1.5 block text-sm text-subtle">อีเมล</label>
            <input
              className="field"
              type="email"
              name="email"
              required
              autoComplete="email"
              autoFocus
              value={form.email}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm text-subtle">รหัสผ่าน</label>
            <input
              className="field"
              type="password"
              name="password"
              required
              autoComplete="current-password"
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
            {submitting ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-subtle">
          ยังไม่มีบัญชี?{' '}
          <Link to="/register" className="text-cyan hover:underline">
            สมัครสมาชิก
          </Link>
        </p>

        {DEMO_LOGIN_ENABLED && demoRevealed && (
          <div className="mt-6 space-y-2 border-t border-line pt-4">
            <p className="text-center text-xs text-faint">Demo login (presentation only)</p>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1 py-2 text-xs"
                disabled={submitting}
                onClick={() => handleDemoLogin('admin')}
              >
                Demo: Admin
              </Button>
              <Button
                type="button"
                variant="outline"
                className="flex-1 py-2 text-xs"
                disabled={submitting}
                onClick={() => handleDemoLogin('staff')}
              >
                Demo: Staff
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
