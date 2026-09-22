-- ════════════════════════════════════════════════════════════════
--  PHANACEA PHARMACIST BUSINESS — Supabase (PostgreSQL) Schema
--  Generated from phanacea_v4_1_fixed_refs_markdown.md
--  Run this once inside the Supabase SQL editor (or via `psql`).
-- ════════════════════════════════════════════════════════════════

-- Extensions ---------------------------------------------------------------
create extension if not exists "pgcrypto"; -- gen_random_uuid(), crypt() helpers

-- ───────────────────────────────────────────────────────────────
-- LAYER 0 — STAFF (back-office login)
-- ───────────────────────────────────────────────────────────────
create table if not exists staff (
  id            serial primary key,
  username      varchar(50)  not null unique,
  email         varchar(255) unique,
  password_hash varchar(255) not null,
  full_name     varchar(255) not null,
  role          varchar(20)  not null default 'pharmacist'
                 check (role in ('owner','pharmacist','assistant','staff')),
  phone         varchar(20),
  is_active     boolean      not null default true,
  last_login_at timestamp,
  created_at    timestamp    not null default now()
);

-- Safety net for projects that ran an earlier version of this schema
-- before `email` existed on staff (CREATE TABLE IF NOT EXISTS above is a
-- no-op on an already-existing `staff` table). Staff now sign in through
-- the same /login form as customers, which looks an email up in `staff`
-- first and falls back to `users` — so every staff account needs one.
alter table staff add column if not exists email varchar(255) unique;

create table if not exists staff_sessions (
  id            serial primary key,
  staff_id      integer      not null references staff(id) on delete cascade,
  session_token varchar(512) not null unique,
  device_info   varchar(500),
  ip_address    varchar(45),
  is_valid      boolean      not null default true,
  expires_at    timestamp    not null,
  created_at    timestamp    not null default now()
);
create index if not exists idx_staff_sessions_staff on staff_sessions(staff_id);

-- Safety net for projects that ran an earlier version of this schema
-- before the 'staff' role existed (CREATE TABLE IF NOT EXISTS above is a
-- no-op on an already-existing `staff` table).
do $$
begin
  alter table staff drop constraint if exists staff_role_check;
  alter table staff add constraint staff_role_check
    check (role in ('owner','pharmacist','assistant','staff'));
exception
  when duplicate_object then null;
end $$;

-- ───────────────────────────────────────────────────────────────
-- LAYER 1 — USERS + SESSION (customer login)
-- ───────────────────────────────────────────────────────────────
create table if not exists users (
  id            serial primary key,
  username      varchar(50)  not null unique,
  email         varchar(255) not null unique,
  password_hash varchar(255) not null,

  full_name     varchar(255) not null,
  phone_number  varchar(20)  unique,
  gender        varchar(10),
  date_of_birth date,
  address       text,

  is_active          boolean   not null default true,
  is_email_verified  boolean   not null default false,
  email_verified_at  timestamp,

  reset_token            varchar(255),
  reset_token_expires_at timestamp,

  created_at timestamp not null default now(),
  updated_at timestamp not null default now()
);

create table if not exists user_sessions (
  id            serial primary key,
  user_id       integer      not null references users(id) on delete cascade,
  session_token varchar(512) not null unique,
  device_info   varchar(500),
  ip_address    varchar(45),
  is_valid      boolean      not null default true,
  expires_at    timestamp    not null,
  created_at    timestamp    not null default now()
);
create index if not exists idx_sessions_user on user_sessions(user_id);

-- ───────────────────────────────────────────────────────────────
-- LAYER 2 — LOOKUP / REFERENCE
-- ───────────────────────────────────────────────────────────────
create table if not exists categories (
  id          serial primary key,
  name        varchar(100) not null unique,
  description text,
  created_at  timestamp    not null default now()
);

create table if not exists product_units (
  id         serial primary key,
  name       varchar(50) not null unique,
  created_at timestamp   not null default now()
);

create table if not exists payment_methods (
  id         serial primary key,
  name       varchar(100) not null unique,
  is_active  boolean      not null default true,
  created_at timestamp    not null default now()
);

-- ───────────────────────────────────────────────────────────────
-- LAYER 3 — MASTER DATA
-- ───────────────────────────────────────────────────────────────
create table if not exists suppliers (
  id           serial primary key,
  name         varchar(255) not null unique,
  contact_name varchar(255),
  phone        varchar(20),
  address      text,
  is_active    boolean      not null default true,
  created_at   timestamp    not null default now()
);

create table if not exists products (
  id          serial primary key,
  name        varchar(255)  not null,
  brand       varchar(255),
  category_id integer       not null references categories(id),
  unit_id     integer       not null references product_units(id),
  price       decimal(10,2) not null,
  stock_qty   integer       not null default 0,
  min_stock   integer       not null default 10,
  description text,
  is_active   boolean       not null default true,
  created_at  timestamp     not null default now(),
  updated_at  timestamp     not null default now()
);
create index if not exists idx_products_category on products(category_id);
create index if not exists idx_products_active on products(is_active);

-- ───────────────────────────────────────────────────────────────
-- LAYER 4 — TRANSACTIONS (sales / shipments)
-- ───────────────────────────────────────────────────────────────
create table if not exists sales (
  id                serial primary key,
  staff_id          integer       not null references staff(id),
  user_id           integer       references users(id),
  payment_method_id integer       not null references payment_methods(id),
  total_amount      decimal(10,2) not null,
  note              text,
  -- Order fulfillment status. POS (in-person, paid-on-the-spot) sales are
  -- created as 'completed' directly; online storefront orders start
  -- 'pending' and are moved forward by staff from the admin console.
  status            varchar(20)   not null default 'pending'
                     check (status in ('pending','preparing','ready','completed','cancelled')),
  sold_at           timestamp     not null default now()
);

-- Safety net for projects that ran an earlier version of this schema
-- before `status` existed: CREATE TABLE IF NOT EXISTS above is a no-op on
-- an already-existing `sales` table, so this ADD COLUMN IF NOT EXISTS is
-- what actually applies the column on a re-run. Harmless (and skipped) on
-- a fresh database, since the column is already defined above.
alter table sales add column if not exists status varchar(20) not null default 'pending';
do $$
begin
  alter table sales add constraint sales_status_check
    check (status in ('pending','preparing','ready','completed','cancelled'));
exception
  when duplicate_object then null;
end $$;

create table if not exists order_lines (
  id              serial primary key,
  sale_id         integer       not null references sales(id) on delete cascade,
  product_id      integer       not null references products(id),
  quantity        integer       not null check (quantity > 0),
  unit_price      decimal(10,2) not null,
  total_price     decimal(10,2) not null,
  dispensing_note text
);
create index if not exists idx_orderlines_sale on order_lines(sale_id);

create table if not exists shipments (
  id          serial primary key,
  supplier_id integer   not null references suppliers(id),
  staff_id    integer   not null references staff(id),
  received_at timestamp not null default now(),
  note        text,
  created_at  timestamp not null default now()
);

create table if not exists shipment_items (
  id          serial primary key,
  shipment_id integer       not null references shipments(id) on delete cascade,
  product_id  integer       not null references products(id),
  quantity    integer       not null check (quantity > 0),
  unit_cost   decimal(10,2) not null,
  total_cost  decimal(10,2) not null,
  expiry_date date,
  lot_number  varchar(100)
);

-- ───────────────────────────────────────────────────────────────
-- LAYER 5 — STOCK MOVEMENTS (audit trail — the only writer of stock)
-- ───────────────────────────────────────────────────────────────
create table if not exists stock_movements (
  id              serial primary key,
  product_id      integer     not null references products(id),
  staff_id        integer     not null references staff(id),
  movement_type   varchar(20) not null
                   check (movement_type in ('sale','restock','adjustment','expired','return','damaged')),
  quantity_change integer     not null,
  stock_after     integer     not null,
  ref_sale_id     integer     references sales(id),
  ref_shipment_id integer     references shipments(id),
  note            text,
  created_at      timestamp   not null default now()
);
create index if not exists idx_movements_product on stock_movements(product_id);

-- ───────────────────────────────────────────────────────────────
-- LAYER 6 — OPERATIONS / CRM
-- ───────────────────────────────────────────────────────────────
create table if not exists allergy_notes (
  id          serial primary key,
  user_id     integer      not null references users(id) on delete cascade,
  allergen    varchar(255) not null,
  severity    varchar(20)  not null default 'moderate'
               check (severity in ('mild','moderate','severe','life_threatening')),
  reaction    text,
  recorded_by integer      references staff(id),
  created_at  timestamp    not null default now()
);

create table if not exists feedback_records (
  id                serial primary key,
  product_id        integer     not null references products(id),
  reported_by_staff integer     not null references staff(id),
  resolved_by_staff integer     references staff(id),
  user_id           integer     references users(id),
  quantity_affected integer,
  feedback_type     varchar(50) not null
                     check (feedback_type in ('complaint','suggestion','quality_issue')),
  detail            text        not null,
  status            varchar(20) not null default 'pending'
                     check (status in ('pending','in_progress','resolved')),
  reported_at       timestamp   not null default now(),
  resolved_at       timestamp
);

-- Customer-facing support / feedback tickets. Deliberately a SEPARATE
-- table from feedback_records above: feedback_records is an internal QA
-- log staff write about a specific product (reported_by_staff is
-- required there), while support_tickets is a customer-initiated inbox
-- that may not reference any product at all. Keeping them apart means a
-- change to one workflow (e.g. quality-control reporting) can never
-- accidentally affect the other (customer support).
-- `channel` splits the same structure into two products: 'ticket' is the
-- classic subject + category form, 'chat' is the always-on live chat with
-- the pharmacy. The last_* columns are denormalised conversation state so
-- the inbox screens can sort and show unread badges without joining to
-- support_ticket_messages on every row.
create table if not exists support_tickets (
  id            serial primary key,
  user_id       integer      not null references users(id) on delete cascade,
  subject       varchar(255) not null,
  category      varchar(30)  not null default 'general'
                 check (category in ('general','product','order','complaint','other')),
  message       text         not null,
  status        varchar(20)  not null default 'open'
                 check (status in ('open','in_progress','resolved','closed')),
  channel       varchar(10)  not null default 'ticket'
                 check (channel in ('ticket','chat')),
  last_message_at    timestamp not null default now(),
  last_sender_type   varchar(10) check (last_sender_type is null or last_sender_type in ('user','staff')),
  staff_last_read_at timestamp,
  user_last_read_at  timestamp,
  staff_reply   text,
  replied_by    integer      references staff(id),
  replied_at    timestamp,
  created_at    timestamp    not null default now(),
  updated_at    timestamp    not null default now()
);
create index if not exists idx_support_tickets_user on support_tickets(user_id);

-- Safety net for databases created before live chat existed (CREATE TABLE
-- IF NOT EXISTS above is a no-op on an existing table). Same statements as
-- database/migrations/002_live_chat.sql, kept here so a single schema.sql
-- run always lands on the current shape.
alter table support_tickets
  add column if not exists channel            varchar(10) not null default 'ticket',
  add column if not exists last_message_at    timestamp   not null default now(),
  add column if not exists last_sender_type   varchar(10),
  add column if not exists staff_last_read_at timestamp,
  add column if not exists user_last_read_at  timestamp;

do $$
begin
  alter table support_tickets add constraint support_tickets_channel_check
    check (channel in ('ticket','chat'));
exception
  when duplicate_object then null;
end $$;

create index if not exists idx_support_tickets_channel
  on support_tickets(channel, last_message_at desc);
create index if not exists idx_support_tickets_user_channel
  on support_tickets(user_id, channel, status);

-- Back-and-forth chat thread for a ticket. The ticket's own `message`
-- column (above) is always the customer's opening message; every reply
-- after that — from either side — lives here, ordered by created_at, so
-- the UI can render one continuous conversation.
create table if not exists support_ticket_messages (
  id               serial primary key,
  ticket_id        integer     not null references support_tickets(id) on delete cascade,
  sender_type      varchar(10) not null check (sender_type in ('user','staff')),
  sender_user_id   integer     references users(id),
  sender_staff_id  integer     references staff(id),
  message          text        not null,
  created_at       timestamp   not null default now(),
  constraint support_ticket_messages_sender_check check (
    (sender_type = 'user'  and sender_user_id  is not null and sender_staff_id is null) or
    (sender_type = 'staff' and sender_staff_id is not null and sender_user_id  is null)
  )
);
create index if not exists idx_support_messages_ticket on support_ticket_messages(ticket_id);

-- ───────────────────────────────────────────────────────────────
-- FUNCTION: process a sale atomically (header + lines + stock log)
-- Called from the backend via supabase.rpc('checkout_sale', {...})
-- payload = jsonb array: [{product_id, quantity, unit_price}]
-- ───────────────────────────────────────────────────────────────
-- Drop the pre-`p_status` signature first. `create or replace` only
-- replaces a function with an IDENTICAL argument list, so without this the
-- old 5-argument version survives as a second overload and PostgREST
-- rejects the RPC with "Could not choose the best candidate function" —
-- which shows up as a checkout that fails right after the customer picks
-- a payment method.
drop function if exists checkout_sale(integer, integer, integer, text, jsonb);

create or replace function checkout_sale(
  p_staff_id integer,
  p_user_id integer,
  p_payment_method_id integer,
  p_note text,
  p_items jsonb,
  p_status varchar default 'pending'
) returns integer as $$
declare
  v_sale_id integer;
  v_total decimal(10,2) := 0;
  v_item jsonb;
  v_stock integer;
begin
  if p_status not in ('pending','preparing','ready','completed','cancelled') then
    raise exception 'INVALID_STATUS: %', p_status;
  end if;

  -- Validate stock first
  for v_item in select * from jsonb_array_elements(p_items) loop
    select stock_qty into v_stock from products where id = (v_item->>'product_id')::integer for update;
    if v_stock is null or v_stock < (v_item->>'quantity')::integer then
      raise exception 'INSUFFICIENT_STOCK: product % ', (v_item->>'product_id');
    end if;
    v_total := v_total + ((v_item->>'quantity')::integer * (v_item->>'unit_price')::decimal);
  end loop;

  insert into sales (staff_id, user_id, payment_method_id, total_amount, note, status)
  values (p_staff_id, p_user_id, p_payment_method_id, v_total, p_note, p_status)
  returning id into v_sale_id;

  for v_item in select * from jsonb_array_elements(p_items) loop
    insert into order_lines (sale_id, product_id, quantity, unit_price, total_price)
    values (
      v_sale_id,
      (v_item->>'product_id')::integer,
      (v_item->>'quantity')::integer,
      (v_item->>'unit_price')::decimal,
      (v_item->>'quantity')::integer * (v_item->>'unit_price')::decimal
    );

    update products set stock_qty = stock_qty - (v_item->>'quantity')::integer, updated_at = now()
      where id = (v_item->>'product_id')::integer
      returning stock_qty into v_stock;

    insert into stock_movements (product_id, staff_id, movement_type, quantity_change, stock_after, ref_sale_id, note)
    values (
      (v_item->>'product_id')::integer,
      p_staff_id,
      'sale',
      -(v_item->>'quantity')::integer,
      v_stock,
      v_sale_id,
      'auto: checkout'
    );
  end loop;

  return v_sale_id;
end;
$$ language plpgsql security definer;

-- ───────────────────────────────────────────────────────────────
-- FUNCTION: manual stock adjustment (restock / correction / expired /
-- damaged / return) used by the admin back-office. This — together with
-- checkout_sale() above — is the ONLY way stock_qty may change; both
-- functions always write a matching stock_movements row in the same
-- transaction, enforcing the "ห้ามแก้ products.stock_qty โดยตรง" rule
-- from the architecture diagram.
-- ───────────────────────────────────────────────────────────────
create or replace function adjust_stock(
  p_product_id integer,
  p_staff_id integer,
  p_movement_type varchar,
  p_quantity_change integer,
  p_note text
) returns integer as $$
declare
  v_stock_after integer;
begin
  if p_movement_type not in ('restock','adjustment','expired','return','damaged') then
    raise exception 'INVALID_MOVEMENT_TYPE: %', p_movement_type;
  end if;

  update products
    set stock_qty = stock_qty + p_quantity_change,
        updated_at = now()
    where id = p_product_id
    returning stock_qty into v_stock_after;

  if v_stock_after is null then
    raise exception 'PRODUCT_NOT_FOUND: %', p_product_id;
  end if;

  if v_stock_after < 0 then
    raise exception 'NEGATIVE_STOCK: product % would go to %', p_product_id, v_stock_after;
  end if;

  insert into stock_movements (product_id, staff_id, movement_type, quantity_change, stock_after, note)
  values (p_product_id, p_staff_id, p_movement_type, p_quantity_change, v_stock_after, p_note);

  return v_stock_after;
end;
$$ language plpgsql security definer;

-- ───────────────────────────────────────────────────────────────
-- FUNCTION: receive a shipment from a supplier (header + line items +
-- stock increase), atomically. This is the THIRD and final writer of
-- products.stock_qty — always paired with a stock_movements row
-- (movement_type = 'restock', ref_shipment_id set) for full traceability.
-- p_items = jsonb array: [{product_id, quantity, unit_cost, expiry_date, lot_number}]
-- ───────────────────────────────────────────────────────────────
create or replace function receive_shipment(
  p_supplier_id integer,
  p_staff_id integer,
  p_note text,
  p_items jsonb
) returns integer as $$
declare
  v_shipment_id integer;
  v_item jsonb;
  v_stock_after integer;
begin
  if p_items is null or jsonb_array_length(p_items) = 0 then
    raise exception 'EMPTY_SHIPMENT';
  end if;

  insert into shipments (supplier_id, staff_id, note)
  values (p_supplier_id, p_staff_id, p_note)
  returning id into v_shipment_id;

  for v_item in select * from jsonb_array_elements(p_items) loop
    insert into shipment_items (shipment_id, product_id, quantity, unit_cost, total_cost, expiry_date, lot_number)
    values (
      v_shipment_id,
      (v_item->>'product_id')::integer,
      (v_item->>'quantity')::integer,
      (v_item->>'unit_cost')::decimal,
      (v_item->>'quantity')::integer * (v_item->>'unit_cost')::decimal,
      nullif(v_item->>'expiry_date', '')::date,
      nullif(v_item->>'lot_number', '')
    );

    update products
      set stock_qty = stock_qty + (v_item->>'quantity')::integer,
          updated_at = now()
      where id = (v_item->>'product_id')::integer
      returning stock_qty into v_stock_after;

    if v_stock_after is null then
      raise exception 'PRODUCT_NOT_FOUND: %', (v_item->>'product_id');
    end if;

    insert into stock_movements (product_id, staff_id, movement_type, quantity_change, stock_after, ref_shipment_id, note)
    values (
      (v_item->>'product_id')::integer,
      p_staff_id,
      'restock',
      (v_item->>'quantity')::integer,
      v_stock_after,
      v_shipment_id,
      'auto: shipment received'
    );
  end loop;

  return v_shipment_id;
end;
$$ language plpgsql security definer;
-- everything else requires the service-role key used by the backend.
-- ───────────────────────────────────────────────────────────────
alter table categories       enable row level security;
alter table product_units    enable row level security;
alter table payment_methods  enable row level security;
alter table products         enable row level security;
alter table suppliers        enable row level security;
alter table sales            enable row level security;
alter table order_lines      enable row level security;
alter table shipments        enable row level security;
alter table shipment_items   enable row level security;
alter table stock_movements  enable row level security;
alter table staff             enable row level security;
alter table staff_sessions    enable row level security;
alter table users            enable row level security;
alter table user_sessions    enable row level security;
alter table allergy_notes    enable row level security;
alter table feedback_records enable row level security;
alter table support_tickets  enable row level security;
alter table support_ticket_messages enable row level security;

-- Public read-only access to the catalog (used by the storefront).
-- CREATE POLICY has no IF NOT EXISTS clause in Postgres, so DROP+CREATE is
-- the idiom for a policy statement safe to run more than once.
drop policy if exists "public read categories" on categories;
create policy "public read categories" on categories for select using (true);
drop policy if exists "public read units" on product_units;
create policy "public read units" on product_units for select using (true);
drop policy if exists "public read payments" on payment_methods;
create policy "public read payments" on payment_methods for select using (true);
drop policy if exists "public read products" on products;
create policy "public read products" on products for select using (is_active = true);

-- Everything else: no anon access. The Node.js backend talks to Supabase
-- using the SERVICE_ROLE key, which bypasses RLS by design, and enforces
-- authorization itself (JWT session + rate limiting — see /backend).
