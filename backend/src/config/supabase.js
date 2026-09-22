const { createClient } = require('@supabase/supabase-js');

const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  // eslint-disable-next-line no-console
  console.warn(
    '[supabase] SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY is missing. ' +
      'Copy backend/.env.example to backend/.env and fill in your project keys.'
  );
}

// The backend always talks to Supabase with the SERVICE ROLE key.
// It bypasses Row Level Security by design — authorization instead
// happens in our own middlewares (JWT + role checks + rate limiting).
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

module.exports = supabase;
