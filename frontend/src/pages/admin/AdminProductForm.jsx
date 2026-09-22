import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import { adminApi } from '../../api/adminApi';

const EMPTY_FORM = {
  name: '',
  brand: '',
  category_id: '',
  unit_id: '',
  price: '',
  stock_qty: '0',
  min_stock: '10',
  description: '',
};

export default function AdminProductForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [meta, setMeta] = useState({ categories: [], units: [] });
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      const metaRes = await adminApi.getProductMeta();
      setMeta(metaRes.data);

      if (isEdit) {
        const productRes = await adminApi.getProduct(id);
        const p = productRes.data;
        setForm({
          name: p.name,
          brand: p.brand || '',
          category_id: p.category?.id || '',
          unit_id: p.unit?.id || '',
          price: p.price,
          stock_qty: '0', // initial-stock field is create-only; edits go through /admin/stock
          min_stock: p.min_stock,
          description: p.description || '',
        });
      }
      setLoading(false);
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const payload = {
        name: form.name,
        brand: form.brand || null,
        category_id: Number(form.category_id),
        unit_id: Number(form.unit_id),
        price: Number(form.price),
        min_stock: Number(form.min_stock),
        description: form.description || null,
      };
      if (isEdit) {
        await adminApi.updateProduct(id, payload);
      } else {
        await adminApi.createProduct({ ...payload, stock_qty: Number(form.stock_qty) || 0 });
      }
      navigate('/admin/products');
    } catch (err) {
      setError(err.message || 'บันทึกไม่สำเร็จ');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="mx-auto max-w-2xl">
      <Link to="/admin/products" className="text-sm text-subtle hover:text-cyan">
        ← กลับไปหน้าจัดการสินค้า
      </Link>
      <h1 className="mt-3 font-display text-2xl font-bold text-ink">
        {isEdit ? 'แก้ไขสินค้า' : 'เพิ่มสินค้าใหม่'}
      </h1>

      <Card className="mt-6 p-6">
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm text-subtle">ชื่อสินค้า</label>
              <input className="field" name="name" required value={form.name} onChange={handleChange} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm text-subtle">ยี่ห้อ</label>
              <input className="field" name="brand" value={form.brand} onChange={handleChange} />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm text-subtle">หมวดหมู่</label>
              <select className="field" name="category_id" required value={form.category_id} onChange={handleChange}>
                <option value="" className="bg-panel">เลือกหมวดหมู่</option>
                {meta.categories.map((c) => (
                  <option key={c.id} value={c.id} className="bg-panel">
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm text-subtle">หน่วย</label>
              <select className="field" name="unit_id" required value={form.unit_id} onChange={handleChange}>
                <option value="" className="bg-panel">เลือกหน่วย</option>
                {meta.units.map((u) => (
                  <option key={u.id} value={u.id} className="bg-panel">
                    {u.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-sm text-subtle">ราคา (บาท)</label>
              <input className="field" type="number" step="0.01" min="0" name="price" required value={form.price} onChange={handleChange} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm text-subtle">
                {isEdit ? 'สต๊อกปัจจุบัน' : 'สต๊อกเริ่มต้น'}
              </label>
              <input
                className="field disabled:opacity-50"
                type="number"
                min="0"
                name="stock_qty"
                value={form.stock_qty}
                onChange={handleChange}
                disabled={isEdit}
              />
              {isEdit && <p className="mt-1 text-xs text-faint">แก้ไขสต๊อกได้ที่หน้า "สต๊อกสินค้า"</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-sm text-subtle">สต๊อกขั้นต่ำ</label>
              <input className="field" type="number" min="0" name="min_stock" required value={form.min_stock} onChange={handleChange} />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm text-subtle">รายละเอียด</label>
            <textarea className="field min-h-[100px]" name="description" value={form.description} onChange={handleChange} />
          </div>

          {error && (
            <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm text-rose-600">
              {error}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <Button disabled={submitting}>{submitting ? 'กำลังบันทึก...' : 'บันทึกสินค้า'}</Button>
            <Button type="button" variant="outline" onClick={() => navigate('/admin/products')}>
              ยกเลิก
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
