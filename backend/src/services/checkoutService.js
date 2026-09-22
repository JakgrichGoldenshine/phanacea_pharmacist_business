const supabase = require('../config/supabase');
const ApiError = require('../utils/ApiError');
const { priceCart } = require('./productService');

// Every sale needs a staff_id for the audit trail (see stock_movements in
// the schema), including online orders where no human operated a till.
// The preferred account is configurable, but a misconfigured or renamed
// account must never be the reason a customer cannot buy anything — so we
// fall back to any active owner, then to any active staff member, and only
// give up when the staff table is genuinely empty.
const PREFERRED_COUNTER_USERNAME = process.env.CHECKOUT_STAFF_USERNAME || 'admin';

let cachedCounterStaffId = null;

async function findStaffId() {
  const byUsername = await supabase
    .from('staff')
    .select('id')
    .eq('username', PREFERRED_COUNTER_USERNAME)
    .eq('is_active', true)
    .maybeSingle();

  if (byUsername.data) return byUsername.data.id;

  const byOwnerRole = await supabase
    .from('staff')
    .select('id')
    .eq('role', 'owner')
    .eq('is_active', true)
    .order('id', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (byOwnerRole.data) return byOwnerRole.data.id;

  const anyActive = await supabase
    .from('staff')
    .select('id')
    .eq('is_active', true)
    .order('id', { ascending: true })
    .limit(1)
    .maybeSingle();

  return anyActive.data ? anyActive.data.id : null;
}

async function getCounterStaffId() {
  if (cachedCounterStaffId) return cachedCounterStaffId;

  const staffId = await findStaffId();
  if (!staffId) {
    throw new ApiError(
      503,
      'ระบบยังไม่พร้อมรับคำสั่งซื้อ: ไม่พบบัญชีพนักงานในระบบ กรุณาติดต่อผู้ดูแลระบบ',
      'CHECKOUT_STAFF_NOT_CONFIGURED'
    );
  }

  cachedCounterStaffId = staffId;
  return cachedCounterStaffId;
}

// Called when a checkout fails on a foreign-key violation against staff —
// e.g. the cached account was deleted while the process was running. The
// next checkout then re-resolves instead of failing forever.
function invalidateCounterStaffCache() {
  cachedCounterStaffId = null;
}

async function assertPaymentMethodUsable(paymentMethodId) {
  const id = Number(paymentMethodId);
  if (!Number.isInteger(id) || id < 1) {
    throw new ApiError(400, 'ช่องทางการชำระเงินไม่ถูกต้อง', 'INVALID_PAYMENT_METHOD');
  }

  const { data, error } = await supabase
    .from('payment_methods')
    .select('id, is_active')
    .eq('id', id)
    .maybeSingle();

  if (error) throw new ApiError(500, error.message, 'DB_ERROR');
  if (!data || !data.is_active) {
    // Checked BEFORE the RPC so a stale payment id gives a readable
    // message instead of an opaque foreign-key error from Postgres.
    throw new ApiError(400, 'ช่องทางการชำระเงินนี้ใช้ไม่ได้แล้ว กรุณาเลือกใหม่อีกครั้ง', 'INVALID_PAYMENT_METHOD');
  }

  return id;
}

// Translates a Postgres/PostgREST failure into something the customer (or
// the developer reading the console) can act on. Anything unrecognised
// returns null and is reported as a generic 500 by the caller, with the
// raw message kept server-side only.
function mapCheckoutError(error) {
  const message = String(error.message || '');

  if (message.includes('INSUFFICIENT_STOCK')) {
    return new ApiError(409, 'สินค้าบางรายการคงเหลือไม่พอ กรุณาตรวจสอบตะกร้าอีกครั้ง', 'INSUFFICIENT_STOCK');
  }

  // PGRST202 = no RPC exists with the arguments we sent.
  if (error.code === 'PGRST202' || message.includes('Could not find the function')) {
    return new ApiError(
      500,
      'ระบบยังไม่ได้ติดตั้งฟังก์ชันฐานข้อมูลสำหรับการสั่งซื้อ กรุณารัน database/schema.sql',
      'CHECKOUT_RPC_MISSING'
    );
  }

  // PGRST203 = several overloads match — the stale 5-argument checkout_sale().
  if (error.code === 'PGRST203' || message.includes('best candidate function')) {
    return new ApiError(
      500,
      'พบฟังก์ชัน checkout_sale ซ้ำซ้อนในฐานข้อมูล กรุณารัน database/migrations/001_checkout_fix.sql',
      'CHECKOUT_RPC_AMBIGUOUS'
    );
  }

  if (error.code === '23503') {
    return new ApiError(400, 'ข้อมูลอ้างอิงของคำสั่งซื้อไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง', 'CHECKOUT_REFERENCE_INVALID');
  }

  return null;
}

async function checkout({ userId, paymentMethodId, items, note }) {
  // Re-price & validate stock server-side first (never trust the client).
  const priced = await priceCart(items);
  const methodId = await assertPaymentMethodUsable(paymentMethodId);
  const staffId = await getCounterStaffId();

  const { data: saleId, error } = await supabase.rpc('checkout_sale', {
    p_staff_id: staffId,
    p_user_id: userId,
    p_payment_method_id: methodId,
    p_note: note ? String(note).slice(0, 1000) : null,
    p_items: priced.lines.map((l) => ({
      product_id: l.product_id,
      quantity: l.quantity,
      unit_price: l.unit_price,
    })),
    // Passed explicitly rather than relying on the SQL default: an online
    // order always starts 'pending' and is moved forward by staff, and
    // naming every argument keeps the RPC signature unambiguous.
    p_status: 'pending',
  });

  if (error) {
    if (error.code === '23503') invalidateCounterStaffCache();

    const mapped = mapCheckoutError(error);
    if (mapped) throw mapped;

    // eslint-disable-next-line no-console
    console.error('[checkout] unexpected RPC failure', error);
    throw new ApiError(500, 'ทำรายการสั่งซื้อไม่สำเร็จ กรุณาลองใหม่อีกครั้ง', 'CHECKOUT_FAILED');
  }

  return { sale_id: saleId, total: priced.subtotal, items: priced.lines };
}

module.exports = { checkout, invalidateCounterStaffCache };
