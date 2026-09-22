import React, { useEffect, useState } from 'react';
import { Search, Plus, Minus, Trash2, CheckCircle2, UserRound } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import { adminApi } from '../../api/adminApi';
import { formatCurrency } from '../../utils/format';

const PAYMENT_METHODS = [
  { id: 1, name: 'เงินสด' },
  { id: 2, name: 'โอนเงิน / QR Code' },
  { id: 3, name: 'บัตรเครดิต' },
];

export default function AdminPos() {
  const [search, setSearch] = useState('');
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  const [cart, setCart] = useState([]); // staff-side cart — deliberately separate from the customer Redux cart
  const [customerEmail, setCustomerEmail] = useState('');
  const [customer, setCustomer] = useState(null);
  const [paymentMethodId, setPaymentMethodId] = useState(1);
  const [note, setNote] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [receipt, setReceipt] = useState(null);

  useEffect(() => {
    setLoadingProducts(true);
    const t = setTimeout(() => {
      adminApi
        .posSearchProducts({ search: search || undefined, limit: 24 })
        .then((res) => setProducts(res.items))
        .finally(() => setLoadingProducts(false));
    }, 250);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    if (!customerEmail.trim()) {
      setCustomer(null);
      return;
    }
    const t = setTimeout(() => {
      adminApi
        .posLookupCustomer(customerEmail.trim())
        .then((res) => setCustomer(res.data))
        .catch(() => setCustomer(null));
    }, 400);
    return () => clearTimeout(t);
  }, [customerEmail]);

  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.product_id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock_qty) return prev; // don't oversell at the register
        return prev.map((i) => (i.product_id === product.id ? { ...i, quantity: i.quantity + 1 } : i));
      }
      if (product.stock_qty <= 0) return prev;
      return [
        ...prev,
        { product_id: product.id, name: product.name, price: Number(product.price), unit: product.unit?.name, stock_qty: product.stock_qty, quantity: 1 },
      ];
    });
  };

  const updateQty = (productId, delta) => {
    setCart((prev) =>
      prev
        .map((i) =>
          i.product_id === productId ? { ...i, quantity: Math.max(1, Math.min(i.stock_qty, i.quantity + delta)) } : i
        )
        .filter((i) => i.quantity > 0)
    );
  };

  const removeItem = (productId) => setCart((prev) => prev.filter((i) => i.product_id !== productId));

  const subtotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const resetSale = () => {
    setCart([]);
    setCustomerEmail('');
    setCustomer(null);
    setNote('');
    setReceipt(null);
    setError('');
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      setError('กรุณาเพิ่มสินค้าอย่างน้อย 1 รายการ');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      const res = await adminApi.posCheckout({
        payment_method_id: paymentMethodId,
        items: cart.map((i) => ({ product_id: i.product_id, quantity: i.quantity })),
        note: note || undefined,
        customer_email: customerEmail.trim() || undefined,
      });
      setReceipt(res.data);
    } catch (err) {
      setError(err.message || 'ชำระเงินไม่สำเร็จ');
    } finally {
      setSubmitting(false);
    }
  };

  if (receipt) {
    return (
      <div className="mx-auto max-w-md py-16 text-center">
        <span className="icon-chip mx-auto h-20 w-20">
          <CheckCircle2 size={32} />
        </span>
        <h1 className="mt-6 font-display text-2xl font-bold text-ink">ขายสำเร็จ!</h1>
        <p className="mt-2 text-subtle">
          คำสั่งซื้อ #{receipt.sale_id} · ยอดรวม {formatCurrency(receipt.total)}
        </p>
        <Button className="mt-8 px-7 py-3" onClick={resetSale}>
          เริ่มรายการใหม่
        </Button>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink">จุดขายหน้าร้าน (POS)</h1>
      <p className="mt-1 text-subtle">สำหรับลูกค้าที่ชำระเงินหน้าร้าน — ระบบจะตัดสต๊อกทันทีเมื่อกดยืนยัน</p>

      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        {/* Product picker */}
        <div className="lg:col-span-3">
          <div className="flex items-center gap-2 rounded-xl border border-line bg-white px-4 py-3">
            <Search size={18} className="shrink-0 text-faint" />
            <input
              className="w-full bg-transparent text-ink outline-none placeholder:text-faint"
              placeholder="ค้นหาสินค้าเพื่อเพิ่มลงรายการขาย..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />
          </div>

          <div className="mt-4">
            {loadingProducts ? (
              <Spinner />
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {products.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => addToCart(p)}
                    disabled={p.stock_qty <= 0}
                    className="card p-4 text-left transition hover:shadow-glowHover disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <p className="text-sm font-medium text-ink">{p.name}</p>
                    <p className="mt-1 text-xs text-faint">คงเหลือ {p.stock_qty} {p.unit?.name}</p>
                    <p className="mt-2 font-display font-bold text-cyan">{formatCurrency(p.price)}</p>
                  </button>
                ))}
                {products.length === 0 && <p className="col-span-full py-8 text-center text-subtle">ไม่พบสินค้า</p>}
              </div>
            )}
          </div>
        </div>

        {/* Cart + checkout */}
        <div className="lg:col-span-2">
          <Card className="p-5">
            <h2 className="font-display font-semibold text-ink">รายการขาย</h2>

            <div className="mt-4 max-h-72 space-y-2 overflow-y-auto">
              {cart.length === 0 && <p className="py-6 text-center text-sm text-subtle">ยังไม่มีสินค้าในรายการ</p>}
              {cart.map((i) => (
                <div key={i.product_id} className="flex items-center justify-between gap-2 rounded-xl border border-line bg-white/60 px-3 py-2">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-ink">{i.name}</p>
                    <p className="text-xs text-faint">{formatCurrency(i.price)} × {i.quantity}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => updateQty(i.product_id, -1)} className="grid h-7 w-7 place-items-center rounded-full border border-line text-subtle hover:text-cyan">
                      <Minus size={12} />
                    </button>
                    <span className="w-5 text-center text-sm">{i.quantity}</span>
                    <button onClick={() => updateQty(i.product_id, 1)} className="grid h-7 w-7 place-items-center rounded-full border border-line text-subtle hover:text-cyan">
                      <Plus size={12} />
                    </button>
                    <button onClick={() => removeItem(i.product_id)} className="ml-1 text-faint hover:text-rose-500">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 border-t border-line pt-4">
              <label className="mb-1.5 flex items-center gap-1.5 text-xs text-subtle">
                <UserRound size={13} /> อีเมลลูกค้า (ไม่บังคับ — สำหรับผูกประวัติการซื้อ)
              </label>
              <input
                className="field text-sm"
                placeholder="customer@email.com"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
              />
              {customerEmail.trim() && (
                <p className={`mt-1 text-xs ${customer ? 'text-cyan' : 'text-faint'}`}>
                  {customer ? `พบบัญชี: ${customer.full_name}` : 'ไม่พบบัญชีนี้ — จะขายแบบไม่ผูกบัญชี'}
                </p>
              )}
            </div>

            <div className="mt-4">
              <label className="mb-1.5 block text-xs text-subtle">ช่องทางชำระเงิน</label>
              <select className="field text-sm" value={paymentMethodId} onChange={(e) => setPaymentMethodId(Number(e.target.value))}>
                {PAYMENT_METHODS.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-4">
              <label className="mb-1.5 block text-xs text-subtle">หมายเหตุ</label>
              <input className="field text-sm" value={note} onChange={(e) => setNote(e.target.value)} />
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-line pt-4">
              <span className="font-display font-semibold text-ink">ยอดรวม</span>
              <span className="font-display text-2xl font-bold text-cyan">{formatCurrency(subtotal)}</span>
            </div>

            {error && <p className="mt-3 text-sm text-rose-500">{error}</p>}

            <Button className="mt-4 w-full py-3" disabled={submitting || cart.length === 0} onClick={handleCheckout}>
              {submitting ? 'กำลังชำระเงิน...' : 'ยืนยันการชำระเงิน'}
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
