import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QrCode, CreditCard, Banknote, Wallet } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import PaymentQRCode from '../components/PaymentQRCode';
import { useCart } from '../hooks/useCart';
import { checkoutApi } from '../api/checkoutApi';
import { formatCurrency } from '../utils/format';

// Demo/placeholder only — this project has no real payment gateway.
// Scanning the QR just opens a video; the card fields are never sent
// anywhere (see handleSubmit — cardInfo is intentionally excluded from
// the checkout payload).
const PAYMENT_QR_URL = 'https://youtu.be/dQw4w9WgXcQ?si=P69m02ohRt-3Woe-';

// Payment methods are database rows, so their ids are not stable across
// environments. Presentation is matched on the NAME instead, with a
// neutral fallback, which means adding a method in the database shows up
// in the storefront without a code change.
function methodPresentation(name = '') {
  if (name.includes('QR') || name.includes('โอน')) return { Icon: QrCode, kind: 'qr' };
  if (name.includes('บัตร')) return { Icon: CreditCard, kind: 'card' };
  if (name.includes('เงินสด')) return { Icon: Banknote, kind: 'cash' };
  return { Icon: Wallet, kind: 'other' };
}

export default function Checkout() {
  const { items, subtotal, clear } = useCart();
  const navigate = useNavigate();

  const [methods, setMethods] = useState([]);
  const [loadingMethods, setLoadingMethods] = useState(true);
  const [methodsError, setMethodsError] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [note, setNote] = useState('');
  const [cardInfo, setCardInfo] = useState({ name: '', number: '', expiry: '', cvv: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Set the moment an order is accepted. Without it, clearing the cart on
  // success would make the "cart is empty" guard below fire and bounce the
  // customer back to /cart instead of to their new order.
  const placedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    checkoutApi
      .methods()
      .then((res) => {
        if (cancelled) return;
        setMethods(res.data);
        // Preselect when there is only one option — one less tap, and it
        // removes the "nothing selected" failure mode entirely.
        if (res.data.length === 1) setSelectedId(res.data[0].id);
      })
      .catch((err) => {
        if (!cancelled) setMethodsError(err.message || 'โหลดช่องทางการชำระเงินไม่สำเร็จ');
      })
      .finally(() => {
        if (!cancelled) setLoadingMethods(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Redirecting has to happen in an effect, never during render: calling
  // navigate() while rendering is what previously cancelled the jump to
  // the order page after a successful checkout.
  useEffect(() => {
    if (items.length === 0 && !placedRef.current) {
      navigate('/cart', { replace: true });
    }
  }, [items.length, navigate]);

  const selected = useMemo(
    () => methods.find((m) => m.id === selectedId) || null,
    [methods, selectedId]
  );
  const selectedKind = selected ? methodPresentation(selected.name).kind : null;
  const isCard = selectedKind === 'card';

  const cardValid =
    !isCard ||
    (cardInfo.name.trim() &&
      cardInfo.number.replace(/\s/g, '').length >= 12 &&
      cardInfo.expiry &&
      cardInfo.cvv.length >= 3);

  const formatCardNumber = (v) => v.replace(/\D/g, '').slice(0, 19).replace(/(.{4})/g, '$1 ').trim();

  const handleSubmit = async () => {
    if (submitting) return;

    if (!selectedId) {
      setError('กรุณาเลือกช่องทางการชำระเงิน');
      return;
    }
    if (!cardValid) {
      setError('กรุณากรอกข้อมูลบัตรให้ครบถ้วน');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const res = await checkoutApi.submit({
        payment_method_id: selectedId,
        items: items.map((i) => ({ product_id: i.id, quantity: i.quantity })),
        note,
        // Card details are deliberately NOT included — there is no payment
        // processor behind this demo, so nothing legitimate would be done
        // with them, and we'd rather not collect/store fake PANs at all.
      });

      // Order the operations so a failure can never lose the cart: the
      // server has already confirmed the sale by this point.
      placedRef.current = true;
      clear();
      // Every payment method lands on the tracking page — cash is paid on
      // delivery, so "checkout" here means "order placed", not "paid".
      navigate(`/orders/${res.data.sale_id}`, { replace: true, state: { justPlaced: true } });
    } catch (err) {
      setError(err.message || 'สั่งซื้อไม่สำเร็จ กรุณาลองใหม่อีกครั้ง');
      setSubmitting(false);
    }
  };

  if (items.length === 0) return null; // the effect above is already redirecting

  return (
    <div className="mx-auto max-w-2xl px-5 py-12">
      <h1 className="font-display text-3xl font-bold text-ink">ชำระเงิน</h1>

      <Card className="mt-8 p-6">
        <h2 className="font-display font-semibold text-ink">เลือกช่องทางการชำระเงิน</h2>

        {loadingMethods ? (
          <Spinner label="กำลังโหลดช่องทางการชำระเงิน..." />
        ) : methodsError ? (
          <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-600">
            {methodsError}
            <button className="ml-2 underline" onClick={() => window.location.reload()}>
              ลองใหม่
            </button>
          </div>
        ) : methods.length === 0 ? (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
            ขณะนี้ยังไม่มีช่องทางการชำระเงินที่เปิดใช้งาน กรุณาติดต่อทีมงาน
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {methods.map((m) => {
              const { Icon } = methodPresentation(m.name);
              return (
                <label
                  key={m.id}
                  className={`flex cursor-pointer items-center justify-between rounded-xl border px-4 py-3 transition ${
                    selectedId === m.id ? 'border-cyan/60 bg-cyan/5' : 'border-line bg-black/[0.02]'
                  }`}
                >
                  <span className="flex items-center gap-2 text-ink">
                    <Icon size={18} className="text-subtle" /> {m.name}
                  </span>
                  <input
                    type="radio"
                    name="payment"
                    className="accent-emerald-600"
                    checked={selectedId === m.id}
                    onChange={() => {
                      setSelectedId(m.id);
                      setError('');
                    }}
                  />
                </label>
              );
            })}
          </div>
        )}

        {selectedKind === 'cash' && (
          <div className="mt-4 rounded-xl border border-line bg-cyan/5 p-4 text-sm text-subtle">
            ชำระเงินสดกับพนักงานเมื่อได้รับสินค้า — ระบบจะติดตามสถานะคำสั่งซื้อให้จนกว่าจะส่งถึงมือคุณ
          </div>
        )}

        {selectedKind === 'qr' && (
          <div className="mt-4 flex flex-col items-center gap-3 rounded-xl border border-line bg-cyan/5 p-5 text-center">
            <PaymentQRCode value={PAYMENT_QR_URL} size={180} />
            <p className="text-sm text-subtle">สแกน QR Code นี้ด้วยแอปธนาคารเพื่อชำระเงิน</p>
          </div>
        )}

        {isCard && (
          <div className="mt-4 space-y-3 rounded-xl border border-line bg-cyan/5 p-4">
            <input
              className="field"
              placeholder="ชื่อบนบัตร"
              value={cardInfo.name}
              onChange={(e) => setCardInfo((c) => ({ ...c, name: e.target.value }))}
            />
            <input
              className="field"
              placeholder="หมายเลขบัตร"
              inputMode="numeric"
              value={cardInfo.number}
              onChange={(e) => setCardInfo((c) => ({ ...c, number: formatCardNumber(e.target.value) }))}
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                className="field"
                placeholder="MM/YY"
                maxLength={5}
                value={cardInfo.expiry}
                onChange={(e) => setCardInfo((c) => ({ ...c, expiry: e.target.value }))}
              />
              <input
                className="field"
                placeholder="CVV"
                inputMode="numeric"
                maxLength={4}
                value={cardInfo.cvv}
                onChange={(e) => setCardInfo((c) => ({ ...c, cvv: e.target.value.replace(/\D/g, '') }))}
              />
            </div>
            <p className="text-xs text-faint">ระบบสาธิต — ข้อมูลบัตรจะไม่ถูกส่งหรือบันทึกไว้ที่ใด</p>
          </div>
        )}

        <label className="mt-6 block text-sm text-subtle">หมายเหตุ (ถ้ามี)</label>
        <textarea
          className="field mt-2 min-h-[90px]"
          placeholder="เช่น อาการที่ต้องการแจ้งเภสัชกร"
          maxLength={1000}
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />

        <div className="mt-6 flex items-center justify-between border-t border-line pt-4">
          <span className="font-display font-semibold text-ink">ยอดชำระทั้งหมด</span>
          <span className="font-display text-2xl font-bold text-cyan glow-text">{formatCurrency(subtotal)}</span>
        </div>

        {error && (
          <p role="alert" className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm text-rose-600">
            {error}
          </p>
        )}

        <Button
          className="mt-6 w-full py-3.5"
          disabled={submitting || loadingMethods || methods.length === 0}
          onClick={handleSubmit}
        >
          {submitting ? 'กำลังดำเนินการ...' : 'ยืนยันการสั่งซื้อ'}
        </Button>
      </Card>
    </div>
  );
}
