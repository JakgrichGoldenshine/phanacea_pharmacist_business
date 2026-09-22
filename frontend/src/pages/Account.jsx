import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserRound, Receipt, LogOut } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useAuth } from '../hooks/useAuth';

export default function Account() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null; // guarded by RequireCustomer at the route level

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="mx-auto max-w-2xl px-5 py-12">
      <h1 className="font-display text-3xl font-bold text-ink">บัญชีของฉัน</h1>

      <Card className="mt-8 p-6">
        <div className="flex items-center gap-4">
          <span className="icon-chip h-16 w-16">
            <UserRound size={28} />
          </span>
          <div>
            <p className="font-display text-lg font-bold text-ink">{user.full_name}</p>
            <p className="text-sm text-subtle">{user.email}</p>
            <p className="text-xs text-faint">@{user.username}</p>
          </div>
        </div>
      </Card>

      <div className="mt-4 space-y-3">
        <Link to="/orders">
          <Card className="flex items-center justify-between p-5">
            <div className="flex items-center gap-3">
              <span className="icon-chip">
                <Receipt size={20} />
              </span>
              <div>
                <p className="font-medium text-ink">คำสั่งซื้อของฉัน</p>
                <p className="text-xs text-subtle">ดูประวัติการสั่งซื้อทั้งหมด</p>
              </div>
            </div>
            <span className="text-subtle">→</span>
          </Card>
        </Link>

        <Card className="p-5">
          <button onClick={handleLogout} className="flex w-full items-center gap-3 text-left">
            <span className="icon-chip border-rose-200 text-rose-600">
              <LogOut size={20} />
            </span>
            <div>
              <p className="font-medium text-ink">ออกจากระบบ</p>
              <p className="text-xs text-subtle">ออกจากบัญชีนี้บนอุปกรณ์นี้</p>
            </div>
          </button>
        </Card>
      </div>

      <div className="mt-6 text-center">
        <Button variant="outline" onClick={() => navigate('/products')}>
          เลือกซื้อสินค้าต่อ
        </Button>
      </div>
    </div>
  );
}
