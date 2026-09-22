-- ════════════════════════════════════════════════════════════════
--  PHANACEA — Seed data (matches the [MOCK DATA] blocks in the spec)
--  Run AFTER schema.sql
-- ════════════════════════════════════════════════════════════════

-- LAYER 0 — staff  (password for all demo accounts: "Passw0rd!")
-- hash below is bcrypt cost=12 for "Passw0rd!"
-- `email` is what the unified /login form matches on (see loginService) —
-- username still exists and still works against POST /api/admin/auth/login.
insert into staff (username, email, password_hash, full_name, role, phone) values
  ('somchai_owner',  'somchai@phanacea.local',  '$2b$12$L0uvb8OyTjon0d48dRl12eJ0hi4QCWYsw8ieqWIiJZjkc9wsLq8Vu', 'ดร.สมชาย ใจดี', 'owner', '081-234-5671'),
  ('pim_pharmacist', 'pim@phanacea.local',      '$2b$12$L0uvb8OyTjon0d48dRl12eJ0hi4QCWYsw8ieqWIiJZjkc9wsLq8Vu', 'ภญ.พิมลพรรณ รักเรียน', 'pharmacist', '081-234-5672'),
  ('taw_assistant',  'taw@phanacea.local',      '$2b$12$L0uvb8OyTjon0d48dRl12eJ0hi4QCWYsw8ieqWIiJZjkc9wsLq8Vu', 'นายต่อพงษ์ ขยันงาน', 'assistant', '081-234-5673')
on conflict (username) do nothing;

-- Dedicated admin back-office account (password: "Admin123!") — use this
-- to log in at /login. Role "owner" has full access.
insert into staff (username, email, password_hash, full_name, role, phone) values
  ('admin', 'admin@phanacea.local', '$2b$12$j8VEAwrR8dVY401iJFeZkOiKdXob8hVQQrKnEDPJy9i7mV0w18tj2', 'ผู้ดูแลระบบ (Admin)', 'owner', '081-234-5670')
on conflict (username) do nothing;

-- Dedicated order-management account (password: "Staff123!") — role
-- "staff" only sees POS / Orders / Shipments in the admin console, not
-- product/stock/support management (see requireRole + AdminLayout nav).
insert into staff (username, email, password_hash, full_name, role, phone) values
  ('staff', 'staff@phanacea.local', '$2b$12$kj8L/jjv15BdBX4iWM07Eew6pkhsXdKTsFOWI43KtzUklxhEi9iha', 'นางสาวมณี ส่งดี (Staff)', 'staff', '081-234-5674')
on conflict (username) do nothing;

-- Backfill phone numbers / emails for databases where the rows above
-- already existed from an earlier run of this seed (before `phone` /
-- `email` were added).
update staff set phone = '081-234-5670' where username = 'admin' and phone is null;
update staff set phone = '081-234-5671' where username = 'somchai_owner' and phone is null;
update staff set phone = '081-234-5672' where username = 'pim_pharmacist' and phone is null;
update staff set phone = '081-234-5673' where username = 'taw_assistant' and phone is null;
update staff set email = 'admin@phanacea.local'   where username = 'admin'          and email is null;
update staff set email = 'somchai@phanacea.local' where username = 'somchai_owner'  and email is null;
update staff set email = 'pim@phanacea.local'     where username = 'pim_pharmacist' and email is null;
update staff set email = 'taw@phanacea.local'     where username = 'taw_assistant'  and email is null;
update staff set email = 'staff@phanacea.local'   where username = 'staff'          and email is null;

-- LAYER 2 — reference/lookup
insert into categories (name, description) values
  ('ยาปฏิชีวนะ (Antibiotics)', null),
  ('ยาแก้ปวดลดไข้ (Analgesics)', null),
  ('วิตามินและอาหารเสริม (Supplements)', null),
  ('ยาโรคเรื้อรัง (Chronic Disease)', null),
  ('ผลิตภัณฑ์ผิวหนัง (Dermatology)', null)
on conflict (name) do nothing;

insert into product_units (name) values
  ('เม็ด'), ('แผง'), ('ขวด'), ('กล่อง'), ('ซอง'), ('หลอด')
on conflict (name) do nothing;

insert into payment_methods (name, is_active) values
  ('เงินสด', true),
  ('โอนเงิน/QR Code', true),
  ('บัตรเครดิต', true)
on conflict (name) do nothing;

-- LAYER 3 — master data
insert into suppliers (name, contact_name, phone) values
  ('บริษัท สยามฟาร์มาซูติคอล จำกัด', 'คุณวิภา สายตรง', '02-111-2222'),
  ('องค์การเภสัชกรรม (GPO)', 'คุณมานะ จัดหา', '02-333-4444')
on conflict (name) do nothing;

insert into products (name, brand, category_id, unit_id, price, stock_qty, min_stock, description) values
  ('Amoxicillin 500mg',  'GPO',   1, 2, 120.00,  40, 10, 'ยาปฏิชีวนะกลุ่มเพนนิซิลลิน ใช้รักษาการติดเชื้อแบคทีเรีย'),
  ('Paracetamol 500mg',  'GPO',   2, 1,   1.50, 500, 50, 'ยาลดไข้ บรรเทาปวดทั่วไป'),
  ('Vitamin C 1000mg',   'Blackmores', 3, 3, 180.00,  18,  5, 'วิตามินซีเสริมภูมิคุ้มกัน'),
  ('Metformin 500mg',    'GPO',   4, 2,  55.00, 196, 20, 'ยาควบคุมระดับน้ำตาลในเลือด'),
  ('Hirudoid Cream 10g', 'Bayer', 5, 6, 240.00,  10,  5, 'ครีมลดรอยฟกช้ำและอาการอักเสบ')
on conflict do nothing;

-- LAYER 1 — demo customer (password: "Passw0rd!")
insert into users (username, email, password_hash, full_name, is_email_verified, email_verified_at) values
  ('somsak88', 'somsak@email.com', '$2b$12$L0uvb8OyTjon0d48dRl12eJ0hi4QCWYsw8ieqWIiJZjkc9wsLq8Vu', 'นายสมศักดิ์ รักสุขภาพ', true, now())
on conflict (email) do nothing;
