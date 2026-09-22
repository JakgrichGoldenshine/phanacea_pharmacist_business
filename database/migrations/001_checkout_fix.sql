-- ════════════════════════════════════════════════════════════════
--  MIGRATION 001 — Checkout reliability fix
--  Safe to run repeatedly on an existing database.
--  Run it in the Supabase SQL editor AFTER schema.sql.
-- ════════════════════════════════════════════════════════════════

-- 1. Remove the stale 5-argument checkout_sale() ------------------
-- An earlier version of the schema defined checkout_sale() without the
-- p_status parameter. `create or replace function` does NOT replace a
-- function whose argument list differs — it creates a SECOND overload
-- alongside it. PostgREST then refuses the RPC call with
-- "Could not choose the best candidate function", which surfaces in the
-- storefront as a checkout that fails only after a payment method has
-- been picked. Dropping the old signature leaves exactly one candidate.
drop function if exists checkout_sale(integer, integer, integer, text, jsonb);

-- 2. Make sure at least one payment method is selectable ----------
-- The storefront now reads this table instead of hardcoding ids 1/2/3,
-- so an empty or fully-deactivated table would leave the customer with
-- no payment option at all.
insert into payment_methods (name, is_active) values
  ('เงินสด', true),
  ('โอนเงิน/QR Code', true),
  ('บัตรเครดิต', true)
on conflict (name) do nothing;

-- 3. Helpful index for the customer order-history screen ----------
create index if not exists idx_sales_user on sales(user_id, sold_at desc);
