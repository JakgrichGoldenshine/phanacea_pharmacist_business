import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import OrderProgressTracker from '../../components/OrderProgressTracker';
import { adminApi } from '../../api/adminApi';
import { formatCurrency } from '../../utils/format';
import { ORDER_STATUSES, orderStatusMeta } from '../../utils/orderStatus';

export default function AdminOrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [nextStatus, setNextStatus] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  const load = () =>
    adminApi.getSale(id).then((res) => {
      setOrder(res.data);
      setNextStatus(res.data.status);
    });

  useEffect(() => {
    load().finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleSaveStatus = async () => {
    setError('');
    setSaved(false);
    setSaving(true);
    try {
      await adminApi.updateSaleStatus(id, nextStatus);
      await load();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err.message || 'อัปเดตสถานะไม่สำเร็จ');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Spinner />;
  if (!order) return <p className="text-subtle">ไม่พบคำสั่งซื้อนี้</p>;

  const currentMeta = orderStatusMeta(order.status);

  return (
    <div className="mx-auto max-w-2xl">
      <Link to="/admin/orders" className="text-sm text-subtle hover:text-cyan">
        ← กลับไปหน้าคำสั่งซื้อ
      </Link>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <h1 className="font-display text-2xl font-bold text-ink">คำสั่งซื้อ #{order.id}</h1>
        <Badge tone={currentMeta.tone}>{currentMeta.label}</Badge>
      </div>

      <Card className="p-6">
        <h2 className="mb-5 font-display font-semibold text-ink">สถานะคำสั่งซื้อ</h2>
        <OrderProgressTracker status={order.status} />
      </Card>

      <Card className="mt-4 p-6">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-faint">ลูกค้า</p>
            <p className="text-ink">{order.user?.full_name || 'ลูกค้าหน้าร้าน'}</p>
          </div>
          <div>
            <p className="text-faint">ช่องทางชำระเงิน</p>
            <p className="text-ink">{order.payment_method?.name}</p>
          </div>
          <div>
            <p className="text-faint">วันที่</p>
            <p className="text-ink">{new Date(order.sold_at).toLocaleString('th-TH')}</p>
          </div>
          <div>
            <p className="text-faint">พนักงานที่ดูแล</p>
            <p className="text-ink">
              {order.staff?.full_name}
              {order.staff?.phone && <span className="text-faint"> · {order.staff.phone}</span>}
            </p>
          </div>
        </div>

        {order.note && (
          <div className="mt-4 rounded-xl border border-line bg-black/[0.02] p-3 text-sm text-subtle">{order.note}</div>
        )}

        <div className="mt-6 space-y-2 border-t border-line pt-4">
          {order.items.map((line) => (
            <div key={line.id} className="flex items-center justify-between text-sm">
              <span className="text-ink">
                {line.product?.name} × {line.quantity}
              </span>
              <span className="text-subtle">{formatCurrency(line.total_price)}</span>
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-line pt-4">
          <span className="font-display font-semibold text-ink">ยอดรวม</span>
          <span className="font-display text-xl font-bold text-cyan">{formatCurrency(order.total_amount)}</span>
        </div>
      </Card>

      <Card className="mt-4 p-6">
        <h2 className="font-display font-semibold text-ink">อัปเดตสถานะคำสั่งซื้อ</h2>
        <p className="mt-1 text-sm text-subtle">ลูกค้าจะเห็นสถานะล่าสุดนี้ในหน้า "คำสั่งซื้อของฉัน" ทันที</p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <select className="field w-auto" value={nextStatus} onChange={(e) => setNextStatus(e.target.value)}>
            {ORDER_STATUSES.map((s) => (
              <option key={s} value={s}>
                {orderStatusMeta(s).label}
              </option>
            ))}
          </select>
          <Button
            className="px-6 py-2.5 text-sm"
            disabled={saving || nextStatus === order.status}
            onClick={handleSaveStatus}
          >
            {saving ? 'กำลังบันทึก...' : 'บันทึกสถานะ'}
          </Button>
          {saved && <span className="text-sm text-cyan">บันทึกแล้ว ✓</span>}
        </div>
        {error && <p className="mt-3 text-sm text-rose-500">{error}</p>}
      </Card>
    </div>
  );
}
