import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Package, Users, Receipt } from 'lucide-react';
import Card from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';
import { adminApi } from '../../api/adminApi';
import { formatCurrency } from '../../utils/format';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [lowStock, setLowStock] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([adminApi.stats(), adminApi.lowStock()])
      .then(([statsRes, lowStockRes]) => {
        setStats(statsRes.data);
        setLowStock(lowStockRes.data.slice(0, 5));
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  const cards = [
    { icon: Receipt, label: 'ยอดขายวันนี้', value: formatCurrency(stats.today_revenue), sub: `${stats.today_orders} คำสั่งซื้อ` },
    { icon: Package, label: 'สินค้าทั้งหมด', value: stats.total_products, sub: 'รายการที่เปิดขาย' },
    { icon: Users, label: 'ลูกค้าทั้งหมด', value: stats.total_customers, sub: 'บัญชีที่สมัครแล้ว' },
    { icon: AlertTriangle, label: 'สต๊อกใกล้หมด', value: stats.low_stock_count, sub: 'รายการต้องเติมสต๊อก' },
  ];

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink">แดชบอร์ด</h1>
      <p className="mt-1 text-subtle">ภาพรวมร้านของคุณวันนี้</p>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(({ icon: Icon, label, value, sub }) => (
          <Card key={label} className="p-5">
            <div className="flex items-center gap-3">
              <span className="icon-chip shrink-0">
                <Icon size={20} />
              </span>
              <div>
                <p className="text-xs text-faint">{label}</p>
                <p className="font-display text-xl font-bold text-ink">{value}</p>
              </div>
            </div>
            <p className="mt-2 text-xs text-subtle">{sub}</p>
          </Card>
        ))}
      </div>

      <Card className="mt-8 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display font-semibold text-ink">สินค้าที่สต๊อกใกล้หมด</h2>
          <Link to="/admin/stock" className="text-sm text-cyan hover:underline">
            ดูทั้งหมด
          </Link>
        </div>
        {lowStock.length === 0 ? (
          <p className="text-sm text-subtle">ไม่มีสินค้าที่สต๊อกใกล้หมด</p>
        ) : (
          <div className="space-y-2">
            {lowStock.map((p) => (
              <div key={p.id} className="flex items-center justify-between rounded-xl border border-line bg-black/[0.02] px-4 py-3">
                <span className="text-sm text-ink">{p.name}</span>
                <span className="text-sm font-semibold text-amber-700">
                  เหลือ {p.stock_qty} {p.unit?.name} (ขั้นต่ำ {p.min_stock})
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
