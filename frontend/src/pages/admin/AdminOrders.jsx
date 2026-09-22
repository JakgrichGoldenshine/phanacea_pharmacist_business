import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import { adminApi } from '../../api/adminApi';
import { formatCurrency } from '../../utils/format';
import { ORDER_STATUSES, orderStatusMeta } from '../../utils/orderStatus';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    adminApi
      .listSales({ limit: 50, status: status || undefined })
      .then((res) => setOrders(res.items))
      .finally(() => setLoading(false));
  }, [status]);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">คำสั่งซื้อทั้งหมด</h1>
          <p className="mt-1 text-subtle">ประวัติการขายจากทุกช่องทาง</p>
        </div>
        <select className="field w-auto" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">ทุกสถานะ</option>
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>
              {orderStatusMeta(s).label}
            </option>
          ))}
        </select>
      </div>

      <Card className="mt-6 overflow-x-auto p-0">
        {loading ? (
          <Spinner />
        ) : (
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-line text-xs uppercase tracking-wide text-faint">
                <th className="px-5 py-3">คำสั่งซื้อ</th>
                <th className="px-5 py-3">ลูกค้า</th>
                <th className="px-5 py-3">ช่องทางชำระเงิน</th>
                <th className="px-5 py-3">สถานะ</th>
                <th className="px-5 py-3">วันที่</th>
                <th className="px-5 py-3 text-right">ยอดรวม</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => {
                const meta = orderStatusMeta(o.status);
                return (
                  <tr key={o.id} className="border-b border-line/60 last:border-0">
                    <td className="px-5 py-3">
                      <Link to={`/admin/orders/${o.id}`} className="font-medium text-cyan hover:underline">
                        #{o.id}
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-subtle">{o.user?.full_name || 'ลูกค้าหน้าร้าน'}</td>
                    <td className="px-5 py-3 text-subtle">{o.payment_method?.name}</td>
                    <td className="px-5 py-3">
                      <Badge tone={meta.tone}>{meta.label}</Badge>
                    </td>
                    <td className="px-5 py-3 text-subtle">{new Date(o.sold_at).toLocaleString('th-TH')}</td>
                    <td className="px-5 py-3 text-right font-semibold text-ink">{formatCurrency(o.total_amount)}</td>
                  </tr>
                );
              })}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-subtle">
                    ยังไม่มีคำสั่งซื้อ
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
