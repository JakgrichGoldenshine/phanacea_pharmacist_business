-- ════════════════════════════════════════════════════════════════
--  MIGRATION 002 — Live customer-support chat
--  Safe to run repeatedly on an existing database.
--  Run it in the Supabase SQL editor AFTER schema.sql.
-- ════════════════════════════════════════════════════════════════
--
--  Design note — why no new table:
--  A live chat and a support ticket are the same thing underneath (a
--  customer-initiated conversation made of alternating messages). Giving
--  chat its own table would have meant a second copy of every query,
--  every permission check and every admin screen. Instead support_tickets
--  gains a `channel` discriminator, and the columns below make the
--  "inbox" queries O(1) per conversation instead of requiring a join to
--  support_ticket_messages just to know who spoke last.
-- ════════════════════════════════════════════════════════════════

alter table support_tickets
  add column if not exists channel            varchar(10) not null default 'ticket',
  add column if not exists last_message_at    timestamp   not null default now(),
  add column if not exists last_sender_type   varchar(10),
  add column if not exists staff_last_read_at timestamp,
  add column if not exists user_last_read_at  timestamp;

do $$
begin
  alter table support_tickets add constraint support_tickets_channel_check
    check (channel in ('ticket', 'chat'));
exception
  when duplicate_object then null;
end $$;

do $$
begin
  alter table support_tickets add constraint support_tickets_last_sender_check
    check (last_sender_type is null or last_sender_type in ('user', 'staff'));
exception
  when duplicate_object then null;
end $$;

-- Backfill rows that existed before this migration: their opening
-- message is by definition from the customer.
update support_tickets
   set last_message_at  = coalesce(updated_at, created_at),
       last_sender_type = coalesce(last_sender_type, 'user')
 where last_sender_type is null;

-- The admin inbox sorts by recency and filters by channel; the customer
-- side looks up "my one open chat".
create index if not exists idx_support_tickets_channel
  on support_tickets(channel, last_message_at desc);
create index if not exists idx_support_tickets_user_channel
  on support_tickets(user_id, channel, status);
