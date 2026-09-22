import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Receipt } from 'lucide-react';
import Card from '../components/ui/Card';
import Spinner from '../components/ui/Spinner';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { orderApi } from '../api/orderApi';
import { formatCurrency } from '../utils/format';
import { orderStatusMeta } from '../utils/orderStatus';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderApi
      .list()
      .then((res) => setOrders(res.data))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  if (orders.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-24 text-center">
        <span className="icon-chip mx-auto h-20 w-20">
          <Receipt size={32} />
        </span>
        <h1 className="mt-6 font-display text-2xl font-bold text-ink">ยังไม่มีคำสั่งซื้อ</h1>
        <p className="mt-2 text-subtle">เมื่อคุณสั่งซื้อสินค้า ประวัติจะแสดงที่นี่</p>
        <Link to="/products">
          <Button className="mt-8 px-7 py-3">เลือกซื้อสินค้า</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-12">
      <h1 className="font-display text-3xl font-bold text-ink">คำสั่งซื้อของฉัน</h1>

      <div className="mt-8 space-y-4">
        {orders.map((o) => {
          const meta = orderStatusMeta(o.status);
          return (
            <Link key={o.id} to={`/orders/${o.id}`}>
              <Card className="flex items-center justify-between gap-4 p-5">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-display font-semibold text-ink">คำสั่งซื้อ #{o.id}</p>
                    <Badge tone={meta.tone}>{meta.label}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-subtle">
                    {new Date(o.sold_at).toLocaleString('th-TH')} · {o.payment_method?.name}
                  </p>
                </div>
                <p className="font-display text-lg font-bold text-cyan">{formatCurrency(o.total_amount)}</p>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
