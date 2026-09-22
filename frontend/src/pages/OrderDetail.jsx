import React, { useEffect, useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { Phone, CheckCircle2 } from 'lucide-react';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Spinner from '../components/ui/Spinner';
import OrderProgressTracker from '../components/OrderProgressTracker';
import { orderApi } from '../api/orderApi';
import { formatCurrency } from '../utils/format';
import { orderStatusMeta } from '../utils/orderStatus';

export default function OrderDetail() {
  const { id } = useParams();
  const location = useLocation();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    orderApi
      .getById(id)
      .then((res) => setOrder(res.data))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Spinner />;
  if (notFound || !order) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-24 text-center">
        <p className="text-subtle">ไม่พบคำสั่งซื้อนี้</p>
        <Link to="/orders" className="mt-4 inline-block text-cyan hover:underline">
          กลับไปหน้าคำสั่งซื้อของฉัน
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-5 py-12">
      <Link to="/orders" className="text-sm text-subtle hover:text-cyan">
        ← กลับไปหน้าคำสั่งซื้อของฉัน
      </Link>

      {location.state?.justPlaced && (
        <div className="mt-4 flex items-center gap-3 rounded-2xl border border-cyan/30 bg-cyan/10 px-5 py-4 text-cyan">
          <CheckCircle2 size={22} />
          <p className="font-display font-semibold">สั่งซื้อสำเร็จ! ติดตามสถานะคำสั่งซื้อของคุณได้ที่นี่</p>
        </div>
      )}

      <h1 className="mt-3 font-display text-3xl font-bold text-ink">คำสั่งซื้อ #{order.id}</h1>
      <div className="mt-2">
        <Badge tone={orderStatusMeta(order.status).tone}>{orderStatusMeta(order.status).label}</Badge>
      </div>
      <p className="mt-2 text-subtle">
        {new Date(order.sold_at).toLocaleString('th-TH')} · ชำระผ่าน {order.payment_method?.name}
      </p>

      <Card className="mt-6 p-6">
        <h2 className="mb-5 font-display font-semibold text-ink">ติดตามสถานะคำสั่งซื้อ</h2>
        <OrderProgressTracker status={order.status} />
      </Card>

      {order.staff?.phone && order.status !== 'cancelled' && order.status !== 'completed' && (
        <Card className="mt-4 flex items-center justify-between p-5">
          <div>
            <p className="text-sm text-subtle">พนักงานที่ดูแลคำสั่งซื้อนี้</p>
            <p className="font-medium text-ink">{order.staff.full_name}</p>
          </div>
          <a
            href={`tel:${order.staff.phone}`}
            className="flex items-center gap-2 rounded-full bg-cyan px-4 py-2 text-sm font-semibold text-void"
          >
            <Phone size={15} /> {order.staff.phone}
          </a>
        </Card>
      )}

      <Card className="mt-4 p-6">
        {order.note && (
          <div className="mb-4 rounded-xl border border-line bg-black/[0.02] p-3 text-sm text-subtle">{order.note}</div>
        )}
        <div className="space-y-3">
          {order.items.map((line) => (
            <div key={line.id} className="flex items-center justify-between text-sm">
              <div>
                <p className="text-ink">{line.product?.name}</p>
                <p className="text-xs text-faint">
                  {line.quantity} × {formatCurrency(line.unit_price)}
                </p>
              </div>
              <span className="font-medium text-ink">{formatCurrency(line.total_price)}</span>
            </div>
          ))}
        </div>
        <div className="mt-6 flex items-center justify-between border-t border-line pt-4">
          <span className="font-display font-semibold text-ink">ยอดรวมทั้งหมด</span>
          <span className="font-display text-2xl font-bold text-cyan glow-text">{formatCurrency(order.total_amount)}</span>
        </div>
      </Card>
    </div>
  );
}
