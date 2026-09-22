import React, { useEffect, useState } from 'react';
import { Plus, Trash2, Truck } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import { adminApi } from '../../api/adminApi';

const emptyLine = () => ({ product_id: '', quantity: '', unit_cost: '', expiry_date: '', lot_number: '' });

export default function AdminShipments() {
  const [shipments, setShipments] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [supplierId, setSupplierId] = useState('');
  const [note, setNote] = useState('');
  const [lines, setLines] = useState([emptyLine()]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Quick "add supplier" — suppliers is small reference data, no need for a whole extra page
  const [showNewSupplier, setShowNewSupplier] = useState(false);
  const [newSupplier, setNewSupplier] = useState({ name: '', contact_name: '', phone: '' });

  const loadAll = () =>
    Promise.all([adminApi.listShipments({ limit: 20 }), adminApi.listSuppliers(), adminApi.listProducts({ limit: 200 })]).then(
      ([shipRes, supRes, prodRes]) => {
        setShipments(shipRes.items);
        setSuppliers(supRes.data);
        setProducts(prodRes.items);
      }
    );

  useEffect(() => {
    loadAll().finally(() => setLoading(false));
  }, []);

  const updateLine = (i, field, value) =>
    setLines((prev) => prev.map((l, idx) => (idx === i ? { ...l, [field]: value } : l)));
  const addLine = () => setLines((prev) => [...prev, emptyLine()]);
  const removeLine = (i) => setLines((prev) => prev.filter((_, idx) => idx !== i));

  const handleAddSupplier = async (e) => {
    e.preventDefault();
    if (!newSupplier.name.trim()) return;
    const res = await adminApi.createSupplier(newSupplier);
    setSuppliers((prev) => [...prev, res.data]);
    setSupplierId(res.data.id);
    setNewSupplier({ name: '', contact_name: '', phone: '' });
    setShowNewSupplier(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!supplierId) return setError('กรุณาเลือกผู้จัดจำหน่าย');
    const validLines = lines.filter((l) => l.product_id && l.quantity && l.unit_cost);
    if (validLines.length === 0) return setError('กรุณาเพิ่มรายการสินค้าอย่างน้อย 1 รายการ');

    setSubmitting(true);
    try {
      await adminApi.createShipment({
        supplier_id: Number(supplierId),
        note: note || undefined,
        items: validLines.map((l) => ({
          product_id: Number(l.product_id),
          quantity: Number(l.quantity),
          unit_cost: Number(l.unit_cost),
          expiry_date: l.expiry_date || undefined,
          lot_number: l.lot_number || undefined,
        })),
      });
      setSuccess('บันทึกใบรับสินค้าเรียบร้อย — สต๊อกถูกอัปเดตแล้ว');
      setSupplierId('');
      setNote('');
      setLines([emptyLine()]);
      await loadAll();
    } catch (err) {
      setError(err.message || 'บันทึกไม่สำเร็จ');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink">ใบรับสินค้า (Shipments)</h1>
      <p className="mt-1 text-subtle">บันทึกสินค้าที่รับเข้าจากผู้จัดจำหน่าย — ระบบจะเพิ่มสต๊อกให้อัตโนมัติ</p>

      <Card className="mt-6 p-6">
        <h2 className="font-display font-semibold text-ink">สร้างใบรับสินค้าใหม่</h2>
        <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm text-subtle">ผู้จัดจำหน่าย</label>
              <div className="flex gap-2">
                <select className="field" value={supplierId} onChange={(e) => setSupplierId(e.target.value)}>
                  <option value="">เลือกผู้จัดจำหน่าย</option>
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
                <Button type="button" variant="outline" className="px-3 py-2" onClick={() => setShowNewSupplier((v) => !v)}>
                  <Plus size={16} />
                </Button>
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm text-subtle">หมายเหตุ</label>
              <input className="field" value={note} onChange={(e) => setNote(e.target.value)} />
            </div>
          </div>

          {showNewSupplier && (
            <div className="grid gap-3 rounded-xl border border-line bg-white/60 p-4 md:grid-cols-4">
              <input
                className="field md:col-span-2"
                placeholder="ชื่อผู้จัดจำหน่าย"
                value={newSupplier.name}
                onChange={(e) => setNewSupplier((s) => ({ ...s, name: e.target.value }))}
              />
              <input
                className="field"
                placeholder="ผู้ติดต่อ"
                value={newSupplier.contact_name}
                onChange={(e) => setNewSupplier((s) => ({ ...s, contact_name: e.target.value }))}
              />
              <div className="flex gap-2">
                <input
                  className="field"
                  placeholder="เบอร์โทร"
                  value={newSupplier.phone}
                  onChange={(e) => setNewSupplier((s) => ({ ...s, phone: e.target.value }))}
                />
                <Button type="button" className="px-4 py-2 text-sm" onClick={handleAddSupplier}>
                  เพิ่ม
                </Button>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <label className="block text-sm text-subtle">รายการสินค้า</label>
            {lines.map((line, i) => (
              <div key={i} className="grid grid-cols-2 gap-2 rounded-xl border border-line bg-white/60 p-3 md:grid-cols-6">
                <select
                  className="field md:col-span-2"
                  value={line.product_id}
                  onChange={(e) => updateLine(i, 'product_id', e.target.value)}
                >
                  <option value="">เลือกสินค้า</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
                <input
                  className="field"
                  type="number"
                  min="1"
                  placeholder="จำนวน"
                  value={line.quantity}
                  onChange={(e) => updateLine(i, 'quantity', e.target.value)}
                />
                <input
                  className="field"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="ต้นทุน/หน่วย"
                  value={line.unit_cost}
                  onChange={(e) => updateLine(i, 'unit_cost', e.target.value)}
                />
                <input
                  className="field"
                  type="date"
                  value={line.expiry_date}
                  onChange={(e) => updateLine(i, 'expiry_date', e.target.value)}
                />
                <div className="flex gap-2">
                  <input
                    className="field"
                    placeholder="Lot no."
                    value={line.lot_number}
                    onChange={(e) => updateLine(i, 'lot_number', e.target.value)}
                  />
                  {lines.length > 1 && (
                    <button type="button" onClick={() => removeLine(i)} className="text-faint hover:text-rose-500">
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            ))}
            <button type="button" onClick={addLine} className="flex items-center gap-1 text-sm text-cyan hover:underline">
              <Plus size={14} /> เพิ่มรายการ
            </button>
          </div>

          {error && <p className="text-sm text-rose-500">{error}</p>}
          {success && <p className="text-sm text-cyan">{success}</p>}

          <Button disabled={submitting}>{submitting ? 'กำลังบันทึก...' : 'บันทึกใบรับสินค้า'}</Button>
        </form>
      </Card>

      <Card className="mt-6 overflow-x-auto p-0">
        <div className="flex items-center gap-2 border-b border-line px-5 py-4">
          <Truck size={16} className="text-cyan" />
          <h2 className="font-display font-semibold text-ink">ประวัติการรับสินค้า</h2>
        </div>
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead>
            <tr className="border-b border-line text-xs uppercase tracking-wide text-faint">
              <th className="px-5 py-3">เลขที่</th>
              <th className="px-5 py-3">ผู้จัดจำหน่าย</th>
              <th className="px-5 py-3">รับโดย</th>
              <th className="px-5 py-3">วันที่</th>
            </tr>
          </thead>
          <tbody>
            {shipments.map((s) => (
              <tr key={s.id} className="border-b border-line/60 last:border-0">
                <td className="px-5 py-3 font-medium text-ink">#{s.id}</td>
                <td className="px-5 py-3 text-subtle">{s.supplier?.name}</td>
                <td className="px-5 py-3 text-subtle">{s.staff?.full_name}</td>
                <td className="px-5 py-3 text-subtle">{new Date(s.received_at).toLocaleString('th-TH')}</td>
              </tr>
            ))}
            {shipments.length === 0 && (
              <tr>
                <td colSpan={4} className="px-5 py-10 text-center text-subtle">
                  ยังไม่มีประวัติการรับสินค้า
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
