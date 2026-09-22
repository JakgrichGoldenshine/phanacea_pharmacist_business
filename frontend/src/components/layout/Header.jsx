import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, UserRound, Menu, X } from 'lucide-react';
import { navLinks } from '../../data/siteContent';
import { useCart } from '../../hooks/useCart';
import { useAuth } from '../../hooks/useAuth';
import { HexLeafIcon } from '../icons/MedicineIcons';

export default function Header() {
  const { count } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(search.trim() ? `/products?search=${encodeURIComponent(search.trim())}` : '/products');
    setOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-space/80 backdrop-blur-xl">
      {/* Top bar */}
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-5 py-4">
        <Link to="/" className="flex shrink-0 items-center gap-2">
          <HexLeafIcon size={34} />
          <span className="font-display text-xl font-bold tracking-tight text-ink">
            Phanacea<span className="text-cyan glow-text">+</span>
          </span>
        </Link>

        <form onSubmit={handleSearch} className="hidden max-w-xl flex-1 md:block">
          <div className="flex items-center gap-2 rounded-full border border-line bg-black/[0.03] px-4 py-2.5 transition focus-within:border-cyan/50">
            <Search size={18} className="shrink-0 text-faint" />
            <input
              className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-faint"
              placeholder="ค้นหายา, ผลิตภัณฑ์สุขภาพ..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </form>

        <div className="ml-auto flex items-center gap-5">
          {user ? (
            <Link to="/account" className="hidden items-center gap-2 text-sm text-subtle hover:text-cyan md:flex">
              <UserRound size={20} />
              <span>{user.full_name?.split(' ')[0]}</span>
            </Link>
          ) : (
            <Link to="/login" className="hidden items-center gap-2 text-sm text-subtle hover:text-cyan md:flex">
              <UserRound size={20} />
              <span>เข้าสู่ระบบ / สมัคร</span>
            </Link>
          )}

          <Link to="/cart" className="relative text-subtle hover:text-cyan">
            <ShoppingCart size={22} />
            {count > 0 && (
              <span className="absolute -right-2 -top-2 grid h-5 w-5 place-items-center rounded-full bg-cyan text-[11px] font-bold text-void shadow-glowBtn">
                {count}
              </span>
            )}
          </Link>

          <button className="text-subtle md:hidden" onClick={() => setOpen((v) => !v)} aria-label="เปิดเมนู">
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Category / nav row */}
      <nav className="hidden border-t border-line md:block">
        <div className="mx-auto flex max-w-7xl gap-8 px-5 py-3">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `text-sm font-medium transition-colors ${isActive ? 'text-cyan glow-text' : 'text-subtle hover:text-ink'}`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Mobile panel */}
      {open && (
        <div className="border-t border-line px-5 py-4 md:hidden">
          <form onSubmit={handleSearch} className="mb-4 flex items-center gap-2 rounded-full border border-line bg-black/[0.03] px-4 py-2.5">
            <Search size={18} className="shrink-0 text-faint" />
            <input
              className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-faint"
              placeholder="ค้นหายา, ผลิตภัณฑ์สุขภาพ..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </form>
          <div className="flex flex-col gap-3">
            {navLinks.map((link) => (
              <NavLink key={link.to} to={link.to} className="text-subtle" onClick={() => setOpen(false)}>
                {link.label}
              </NavLink>
            ))}
            {user ? (
              <Link to="/account" className="text-cyan" onClick={() => setOpen(false)}>
                บัญชีของฉัน
              </Link>
            ) : (
              <Link to="/login" className="text-cyan" onClick={() => setOpen(false)}>
                เข้าสู่ระบบ / สมัครสมาชิก
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
