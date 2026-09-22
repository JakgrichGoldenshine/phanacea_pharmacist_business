import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import { adminApi } from '../../api/adminApi';
import { formatCurrency, stockLabel } from '../../utils/format';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  const load = () => {
    setLoading(true);
    adminApi
      .listProducts({ search: search || undefined, limit: 100 })
      .then((res) => setProducts(res.items))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const handleDeactivate = async (id) => {
    if (!confirm('ยืนยันการปิดการขายสินค้านี้?')) return;
    setBusyId(id);
    try {
      await adminApi.deleteProduct(id);
      load();
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">จัดการสินค้า</h1>
          <p className="mt-1 text-subtle">เพิ่ม แก้ไข หรือปิดการขายสินค้า</p>
        </div>
        <Link to="/admin/products/new">
          <Button className="px-5 py-2.5 text-sm">
            <Plus size={16} /> เพิ่มสินค้า
          </Button>
        </Link>
      </div>

      <div className="mt-6 flex items-center gap-2 rounded-xl border border-line bg-black/[0.03] px-4 py-3 md:max-w-sm">
        <Search size={18} className="shrink-0 text-faint" />
        <input
          className="w-full bg-transparent text-ink outline-none placeholder:text-faint"
          placeholder="ค้นหาสินค้า..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Card className="mt-6 overflow-x-auto p-0">
        {loading ? (
          <Spinner />
        ) : (
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-line text-xs uppercase tracking-wide text-faint">
                <th className="px-5 py-3">สินค้า</th>
                <th className="px-5 py-3">หมวดหมู่</th>
                <th className="px-5 py-3">ราคา</th>
                <th className="px-5 py-3">สต๊อก</th>
                <th className="px-5 py-3">สถานะ</th>
                <th className="px-5 py-3 text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => {
                const stock = stockLabel(p.stock_qty, p.min_stock);
                return (
                  <tr key={p.id} className="border-b border-line/60 last:border-0">
                    <td className="px-5 py-3">
                      <p className="font-medium text-ink">{p.name}</p>
                      <p className="text-xs text-faint">{p.brand}</p>
                    </td>
                    <td className="px-5 py-3 text-subtle">{p.category?.name}</td>
                    <td className="px-5 py-3 text-ink">{formatCurrency(p.price)}</td>
                    <td className="px-5 py-3">
                      <Badge tone={stock.tone}>{stock.text}</Badge>
                    </td>
                    <td className="px-5 py-3">
                      {p.is_active ? (
                        <span className="text-xs text-cyan">เปิดขาย</span>
                      ) : (
                        <span className="text-xs text-faint">ปิดขาย</span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-2">
                        <Link
                          to={`/admin/products/${p.id}`}
                          className="grid h-8 w-8 place-items-center rounded-lg border border-line text-subtle hover:text-cyan"
                        >
                          <Pencil size={14} />
                        </Link>
                        <button
                          disabled={busyId === p.id || !p.is_active}
                          onClick={() => handleDeactivate(p.id)}
                          className="grid h-8 w-8 place-items-center rounded-lg border border-line text-subtle hover:text-rose-600 disabled:opacity-30"
                          aria-label="ปิดการขาย"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {products.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-subtle">
                    ไม่พบสินค้า
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
