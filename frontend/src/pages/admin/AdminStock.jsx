import React, { useEffect, useState } from 'react';
import { ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import { adminApi } from '../../api/adminApi';

const MOVEMENT_LABELS = {
  restock: 'รับสินค้าเข้า',
  adjustment: 'ปรับปรุงสต๊อก',
  expired: 'สินค้าหมดอายุ',
  return: 'ลูกค้าคืนสินค้า',
  damaged: 'สินค้าเสียหาย',
  sale: 'ขายสินค้า',
};

export default function AdminStock() {
  const [products, setProducts] = useState([]);
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ product_id: '', movement_type: 'restock', quantity_change: '', note: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadMovements = () => adminApi.listMovements({ limit: 20 }).then((res) => setMovements(res.items));

  useEffect(() => {
    Promise.all([adminApi.listProducts({ limit: 200 }), loadMovements()])
      .then(([productsRes]) => setProducts(productsRes.items))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const isNegativeType = ['expired', 'damaged'].includes(form.movement_type);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);
    try {
      const magnitude = Math.abs(Number(form.quantity_change));
      const signedQty = isNegativeType ? -magnitude : magnitude;

      await adminApi.adjustStock({
        product_id: Number(form.product_id),
        movement_type: form.movement_type,
        quantity_change: signedQty,
        note: form.note || undefined,
      });

      setSuccess('ปรับปรุงสต๊อกเรียบร้อย');
      setForm({ product_id: '', movement_type: 'restock', quantity_change: '', note: '' });
      const [productsRes] = await Promise.all([adminApi.listProducts({ limit: 200 }), loadMovements()]);
      setProducts(productsRes.items);
    } catch (err) {
      setError(err.message || 'ปรับปรุงสต๊อกไม่สำเร็จ');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink">สต๊อกสินค้า</h1>
      <p className="mt-1 text-subtle">รับสินค้าเข้า ปรับปรุง หรือบันทึกสินค้าเสียหาย/หมดอายุ</p>

      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        <Card className="p-6 lg:col-span-2">
          <h2 className="font-display font-semibold text-ink">บันทึกการเคลื่อนไหวสต๊อก</h2>
          <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="mb-1.5 block text-sm text-subtle">สินค้า</label>
              <select className="field" name="product_id" required value={form.product_id} onChange={handleChange}>
                <option value="" className="bg-panel">เลือกสินค้า</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id} className="bg-panel">
                    {p.name} (คงเหลือ {p.stock_qty})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm text-subtle">ประเภท</label>
              <select className="field" name="movement_type" value={form.movement_type} onChange={handleChange}>
                <option value="restock" className="bg-panel">รับสินค้าเข้า (+)</option>
                <option value="adjustment" className="bg-panel">ปรับปรุงยอด (+)</option>
                <option value="return" className="bg-panel">ลูกค้าคืนสินค้า (+)</option>
                <option value="expired" className="bg-panel">สินค้าหมดอายุ (-)</option>
                <option value="damaged" className="bg-panel">สินค้าเสียหาย (-)</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm text-subtle">จำนวน</label>
              <input
                className="field"
                type="number"
                min="1"
                name="quantity_change"
                required
                value={form.quantity_change}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm text-subtle">หมายเหตุ</label>
              <input className="field" name="note" value={form.note} onChange={handleChange} />
            </div>

            {error && <p className="text-sm text-rose-600">{error}</p>}
            {success && <p className="text-sm text-cyan">{success}</p>}

            <Button className="w-full" disabled={submitting}>
              {submitting ? 'กำลังบันทึก...' : 'บันทึกการเคลื่อนไหว'}
            </Button>
          </form>
        </Card>

        <Card className="p-6 lg:col-span-3">
          <h2 className="font-display font-semibold text-ink">ประวัติล่าสุด</h2>
          <div className="mt-4 space-y-2">
            {movements.map((m) => (
              <div key={m.id} className="flex items-center justify-between rounded-xl border border-line bg-black/[0.02] px-4 py-3">
                <div className="flex items-center gap-3">
                  {m.quantity_change >= 0 ? (
                    <ArrowUpCircle size={18} className="text-cyan" />
                  ) : (
                    <ArrowDownCircle size={18} className="text-rose-600" />
                  )}
                  <div>
                    <p className="text-sm text-ink">{m.product?.name}</p>
                    <p className="text-xs text-faint">
                      {MOVEMENT_LABELS[m.movement_type] || m.movement_type} · {m.staff?.full_name || 'ระบบ'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-semibold ${m.quantity_change >= 0 ? 'text-cyan' : 'text-rose-600'}`}>
                    {m.quantity_change >= 0 ? '+' : ''}
                    {m.quantity_change}
                  </p>
                  <p className="text-xs text-faint">คงเหลือ {m.stock_after}</p>
                </div>
              </div>
            ))}
            {movements.length === 0 && <p className="text-sm text-subtle">ยังไม่มีประวัติ</p>}
          </div>
        </Card>
      </div>
    </div>
  );
}
