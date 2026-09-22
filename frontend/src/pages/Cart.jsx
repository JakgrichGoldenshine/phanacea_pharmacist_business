import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, X } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import QuantityInput from '../components/ui/QuantityInput';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import { productApi } from '../api/productApi';
import { formatCurrency } from '../utils/format';

export default function Cart() {
  const { items, updateQty, remove, subtotal } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [verified, setVerified] = useState(null);
  const [checking, setChecking] = useState(false);
  const [priceError, setPriceError] = useState('');

  // เช็กราคาสินค้าจริงจากเซิร์ฟเวอร์ก่อนไปหน้าชำระเงินเสมอ
  useEffect(() => {
    if (items.length === 0) {
      setVerified(null);
      return;
    }
    setChecking(true);
    setPriceError('');
    productApi
      .priceCheck(items.map((i) => ({ product_id: i.id, quantity: i.quantity })))
      .then((res) => setVerified(res.data))
      .catch((err) => setPriceError(err.message))
      .finally(() => setChecking(false));
  }, [items]);

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-24 text-center">
        <span className="icon-chip mx-auto h-20 w-20">
          <ShoppingCart size={32} />
        </span>
        <h1 className="mt-6 font-display text-2xl font-bold text-ink">ตะกร้าของคุณว่างเปล่า</h1>
        <p className="mt-2 text-subtle">เลือกสินค้าที่ต้องการเพื่อเริ่มการสั่งซื้อ</p>
        <Link to="/products">
          <Button className="mt-8 px-7 py-3">เลือกซื้อสินค้า</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-5 py-12">
      <h1 className="font-display text-3xl font-bold text-ink">ตะกร้าสินค้า</h1>

      <div className="mt-8 space-y-4">
        {items.map((item) => (
          <Card key={item.id} className="flex flex-wrap items-center justify-between gap-4 p-5">
            <div>
              <p className="font-display font-semibold text-ink">{item.name}</p>
              <p className="text-sm text-subtle">
                {formatCurrency(item.price)} / {item.unit}
              </p>
            </div>
            <div className="flex items-center gap-5">
              <QuantityInput value={item.quantity} onChange={(q) => updateQty(item.id, q)} max={item.stock_qty} />
              <p className="w-24 text-right font-display font-semibold text-ink">
                {formatCurrency(item.price * item.quantity)}
              </p>
              <button onClick={() => remove(item.id)} className="text-faint hover:text-rose-500" aria-label="ลบสินค้า">
                <X size={18} />
              </button>
            </div>
          </Card>
        ))}
      </div>

      <Card className="mt-8 p-6">
        {priceError && <p className="mb-3 text-sm text-rose-500">{priceError}</p>}
        <div className="flex items-center justify-between text-subtle">
          <span>ยอดรวมสินค้า</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        {checking ? (
          <p className="mt-2 text-xs text-faint">กำลังตรวจสอบราคาล่าสุด...</p>
        ) : (
          verified &&
          Math.round(verified.subtotal) !== Math.round(subtotal) && (
            <p className="mt-2 text-xs text-amber-700">
              ราคาบางรายการมีการเปลี่ยนแปลง ยอดล่าสุด: {formatCurrency(verified.subtotal)}
            </p>
          )
        )}
        <div className="mt-4 flex items-center justify-between border-t border-line pt-4">
          <span className="font-display text-lg font-semibold text-ink">ยอดชำระทั้งหมด</span>
          <span className="font-display text-2xl font-bold text-cyan glow-text">
            {formatCurrency(verified?.subtotal ?? subtotal)}
          </span>
        </div>

        <Button
          className="mt-6 w-full py-3.5"
          disabled={checking || !!priceError}
          onClick={() => (user ? navigate('/checkout') : navigate('/login?redirect=/checkout'))}
        >
          ดำเนินการชำระเงิน
        </Button>
      </Card>
    </div>
  );
}
