import React, { useCallback, useEffect, useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  PackageSearch,
  Boxes,
  ClipboardList,
  ShoppingCart,
  LifeBuoy,
  MessagesSquare,
  Users,
  Truck,
  UserCog,
  LogOut,
} from 'lucide-react';
import { HexLeafIcon } from '../icons/MedicineIcons';
import { useAdminAuth } from '../../hooks/useAdminAuth';
import { usePolling } from '../../hooks/usePolling';
import { adminApi } from '../../api/adminApi';

const WAITING_POLL_MS = 15000;

// `roles: null` means every logged-in staff member sees it. The 'staff'
// role (README: "manage the order") only ever sees Dashboard/POS/Orders —
// mirrors the requireRole('owner','pharmacist','assistant') gate already
// enforced server-side on products/stock/support/suppliers/shipments, so
// the sidebar can never promise access the API would then refuse.
const NAV = [
  { to: '/admin', label: 'แดชบอร์ด', icon: LayoutDashboard, end: true, roles: null },
  { to: '/admin/pos', label: 'จุดขาย (POS)', icon: ShoppingCart, roles: null },
  { to: '/admin/orders', label: 'คำสั่งซื้อ', icon: ClipboardList, roles: null },
  { to: '/admin/products', label: 'จัดการสินค้า', icon: PackageSearch, roles: ['owner', 'pharmacist', 'assistant'] },
  { to: '/admin/stock', label: 'สต๊อกสินค้า', icon: Boxes, roles: ['owner', 'pharmacist', 'assistant'] },
  { to: '/admin/shipments', label: 'ใบรับสินค้า', icon: Truck, roles: ['owner', 'pharmacist', 'assistant'] },
  { to: '/admin/chat', label: 'แชทสด', icon: MessagesSquare, roles: null, badge: 'chat' },
  { to: '/admin/support', label: 'ข้อความติดต่อ', icon: LifeBuoy, roles: ['owner', 'pharmacist', 'assistant'] },
  { to: '/admin/staff', label: 'บัญชีผู้ดูแล', icon: Users, roles: ['owner'] },
];

export default function AdminLayout({ children }) {
  const { staff, logout } = useAdminAuth();
  const navigate = useNavigate();
  const [waitingChats, setWaitingChats] = useState(0);
  const visibleNav = NAV.filter((item) => !item.roles || item.roles.includes(staff?.role));

  // How many customers are waiting for a reply right now. Polled slowly —
  // it is an ambient signal, not something anyone stares at — and failures
  // are ignored so a hiccup never breaks the whole console shell.
  const refreshWaiting = useCallback(
    () =>
      adminApi
        .chatWaitingCount()
        .then((res) => setWaitingChats(res.data.waiting))
        .catch(() => {}),
    []
  );

  useEffect(() => {
    refreshWaiting();
  }, [refreshWaiting]);

  usePolling(refreshWaiting, WAITING_POLL_MS, Boolean(staff));

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen bg-space text-ink">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-line bg-panel/60 backdrop-blur-xl md:flex">
        <Link to="/admin" className="flex items-center gap-2 px-6 py-6">
          <HexLeafIcon size={32} />
          <div>
            <p className="font-display text-lg font-bold leading-none">Phanacea</p>
            <p className="text-[11px] tracking-wide text-faint">ADMIN CONSOLE</p>
          </div>
        </Link>

        <nav className="flex-1 space-y-1 px-3">
          {visibleNav.map(({ to, label, icon: Icon, end, badge }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
                  isActive ? 'bg-cyan/10 text-cyan' : 'text-subtle hover:bg-panelLight hover:text-ink'
                }`
              }
            >
              <Icon size={18} />
              <span className="flex-1">{label}</span>
              {badge === 'chat' && waitingChats > 0 && (
                <span className="grid h-5 min-w-[20px] place-items-center rounded-full bg-cyan px-1.5 text-[11px] font-bold text-void">
                  {waitingChats}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-line p-4">
          <p className="truncate text-sm font-semibold text-ink">{staff?.full_name}</p>
          <p className="text-xs capitalize text-faint">{staff?.role}</p>
          <Link
            to="/admin/account"
            className="mt-3 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-subtle hover:bg-panelLight hover:text-cyan"
          >
            <UserCog size={16} /> บัญชีของฉัน
          </Link>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-subtle hover:bg-panelLight hover:text-rose-600"
          >
            <LogOut size={16} /> ออกจากระบบ
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="fixed inset-x-0 top-0 z-30 flex items-center justify-between border-b border-line bg-panel/80 px-4 py-3 backdrop-blur md:hidden">
        <Link to="/admin" className="flex items-center gap-2">
          <HexLeafIcon size={26} />
          <span className="font-display font-bold">Admin</span>
        </Link>
        <button onClick={handleLogout} className="text-subtle">
          <LogOut size={18} />
        </button>
      </div>

      <main className="flex-1 pt-16 md:ml-64 md:pt-0">
        <div className="mx-auto max-w-6xl px-5 py-8 md:px-8 md:py-10">{children}</div>
      </main>
    </div>
  );
}
