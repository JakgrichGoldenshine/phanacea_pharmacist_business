import React, { useCallback, useEffect, useState } from 'react';
import { UserPlus, KeyRound, ShieldCheck, ShieldOff } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import { adminApi } from '../../api/adminApi';
import { useAdminAuth } from '../../hooks/useAdminAuth';

// Role labels live here rather than in a shared util because they are only
// ever shown on this screen — the rest of the console cares about what a
// role can DO (see RequireAdmin / requireRole), not what it is called.
const ROLE_LABELS = {
  owner: 'เจ้าของร้าน (owner)',
  pharmacist: 'เภสัชกร (pharmacist)',
  assistant: 'ผู้ช่วย (assistant)',
  staff: 'พนักงานขาย (staff)',
};

const EMPTY_FORM = { username: '', password: '', full_name: '', role: 'pharmacist', phone: '' };

export default function AdminStaff() {
  const { staff: me } = useAdminAuth();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [busyId, setBusyId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const load = useCallback(
    () =>
      adminApi
        .listStaff()
        .then((res) => setAccounts(res.data))
        .catch((err) => setError(err.message)),
    []
  );

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, [load]);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    setNotice('');
    setSubmitting(true);
    try {
      const created = await adminApi.createStaff(form);
      setForm(EMPTY_FORM);
      setShowForm(false);
      setNotice(`สร้างบัญชี "${created.data.username}" เรียบร้อย`);
      await load();
    } catch (err) {
      setError(err.message || 'สร้างบัญชีไม่สำเร็จ');
    } finally {
      setSubmitting(false);
    }
  };

  const runAction = async (id, action, successMessage) => {
    setError('');
    setNotice('');
    setBusyId(id);
    try {
      await action();
      setNotice(successMessage);
      await load();
    } catch (err) {
      setError(err.message || 'ดำเนินการไม่สำเร็จ');
    } finally {
      setBusyId(null);
    }
  };

  const handleToggleActive = (account) =>
    runAction(
      account.id,
      () => adminApi.updateStaff(account.id, { is_active: !account.is_active }),
      account.is_active
        ? `ปิดใช้งานบัญชี "${account.username}" แล้ว — บัญชีนี้ถูกออกจากระบบทุกอุปกรณ์`
        : `เปิดใช้งานบัญชี "${account.username}" แล้ว`
    );

  const handleRoleChange = (account, role) =>
    runAction(account.id, () => adminApi.updateStaff(account.id, { role }), `เปลี่ยนตำแหน่ง "${account.username}" แล้ว`);

  const handleResetPassword = (account) => {
    // eslint-disable-next-line no-alert
    const password = window.prompt(
      `ตั้งรหัสผ่านใหม่สำหรับ "${account.username}"\n(อย่างน้อย 8 ตัวอักษร มีทั้งตัวอักษรและตัวเลข)`
    );
    if (!password) return;

    runAction(
      account.id,
      () => adminApi.resetStaffPassword(account.id, password),
      `ตั้งรหัสผ่านใหม่ให้ "${account.username}" เรียบร้อย — บัญชีนี้ถูกออกจากระบบทุกอุปกรณ์`
    );
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">บัญชีผู้ดูแลระบบ</h1>
          <p className="mt-1 text-subtle">สร้าง ปิดใช้งาน และตั้งรหัสผ่านใหม่ให้พนักงานหลังร้าน</p>
        </div>
        <Button onClick={() => setShowForm((v) => !v)} className="px-5 py-2.5 text-sm">
          <UserPlus size={16} /> เพิ่มบัญชีใหม่
        </Button>
      </div>

      {notice && (
        <p className="mt-4 rounded-xl border border-cyan/30 bg-cyan/10 px-4 py-2.5 text-sm text-cyan">{notice}</p>
      )}
      {error && (
        <p role="alert" className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm text-rose-600">
          {error}
        </p>
      )}

      {showForm && (
        <Card className="mt-6 p-6">
          <form className="grid gap-4 md:grid-cols-2" onSubmit={handleCreate}>
            <div>
              <label className="mb-1.5 block text-sm text-subtle">ชื่อผู้ใช้</label>
              <input
                className="field"
                name="username"
                required
                autoComplete="off"
                placeholder="เช่น pim_pharmacist"
                value={form.username}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm text-subtle">รหัสผ่านเริ่มต้น</label>
              <input
                className="field"
                name="password"
                type="password"
                required
                autoComplete="new-password"
                placeholder="อย่างน้อย 8 ตัว มีตัวอักษร+ตัวเลข"
                value={form.password}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm text-subtle">ชื่อ-นามสกุล</label>
              <input className="field" name="full_name" required value={form.full_name} onChange={handleChange} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm text-subtle">ตำแหน่ง</label>
              <select className="field" name="role" value={form.role} onChange={handleChange}>
                {Object.entries(ROLE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm text-subtle">เบอร์โทร (ถ้ามี)</label>
              <input className="field" name="phone" value={form.phone} onChange={handleChange} />
            </div>
            <div className="flex items-end">
              <Button className="w-full py-3" disabled={submitting}>
                {submitting ? 'กำลังสร้าง...' : 'สร้างบัญชี'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      <Card className="mt-6 overflow-x-auto p-0">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead>
            <tr className="border-b border-line text-xs uppercase tracking-wide text-faint">
              <th className="px-5 py-3">ชื่อผู้ใช้</th>
              <th className="px-5 py-3">ชื่อ-นามสกุล</th>
              <th className="px-5 py-3">ตำแหน่ง</th>
              <th className="px-5 py-3">สถานะ</th>
              <th className="px-5 py-3">เข้าสู่ระบบล่าสุด</th>
              <th className="px-5 py-3 text-right">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {accounts.map((account) => {
              const isSelf = account.id === me?.id;
              const busy = busyId === account.id;
              return (
                <tr key={account.id} className="border-b border-line/60 last:border-0">
                  <td className="px-5 py-3 font-medium text-ink">
                    {account.username}
                    {isSelf && <span className="ml-2 text-xs text-faint">(คุณ)</span>}
                  </td>
                  <td className="px-5 py-3 text-subtle">{account.full_name}</td>
                  <td className="px-5 py-3">
                    {/* Self-service role changes are blocked server-side too;
                        disabling the control keeps the UI honest about it. */}
                    <select
                      className="field w-auto py-1.5 text-xs"
                      value={account.role}
                      disabled={isSelf || busy}
                      onChange={(e) => handleRoleChange(account, e.target.value)}
                    >
                      {Object.entries(ROLE_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-5 py-3">
                    <Badge tone={account.is_active ? 'ok' : 'danger'}>
                      {account.is_active ? 'ใช้งานอยู่' : 'ปิดใช้งาน'}
                    </Badge>
                  </td>
                  <td className="px-5 py-3 text-xs text-faint">
                    {account.last_login_at ? new Date(account.last_login_at).toLocaleString('th-TH') : '—'}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        className="flex items-center gap-1 rounded-lg border border-line px-2.5 py-1.5 text-xs text-subtle hover:text-cyan disabled:opacity-40"
                        disabled={busy}
                        onClick={() => handleResetPassword(account)}
                      >
                        <KeyRound size={14} /> รหัสผ่านใหม่
                      </button>
                      <button
                        className="flex items-center gap-1 rounded-lg border border-line px-2.5 py-1.5 text-xs text-subtle hover:text-rose-600 disabled:opacity-40"
                        disabled={busy || isSelf}
                        title={isSelf ? 'ไม่สามารถปิดใช้งานบัญชีตัวเองได้' : undefined}
                        onClick={() => handleToggleActive(account)}
                      >
                        {account.is_active ? <ShieldOff size={14} /> : <ShieldCheck size={14} />}
                        {account.is_active ? 'ปิดใช้งาน' : 'เปิดใช้งาน'}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>

      <p className="mt-4 text-xs text-faint">
        การตั้งรหัสผ่านใหม่หรือปิดใช้งานบัญชี จะทำให้บัญชีนั้นถูกออกจากระบบทุกอุปกรณ์ทันที
      </p>
    </div>
  );
}
