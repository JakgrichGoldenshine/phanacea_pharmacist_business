-- ════════════════════════════════════════════════════════════════
--  Migration 003 — add `email` to staff (unified customer/staff login)
--  Safe to run more than once.
-- ════════════════════════════════════════════════════════════════

-- The app now has a single /login form for both customers and staff:
-- it looks the submitted email up in `staff` first, then `users`. Staff
-- accounts created before this migration only have a `username`, so they
-- need an email added (see database/seed.sql for the demo accounts, or
-- `npm run create-admin -- --username <u> --email <e> --password <p>`
-- for a real one) before they can sign in through the unified form.
alter table staff add column if not exists email varchar(255) unique;
