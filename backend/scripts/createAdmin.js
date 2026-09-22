#!/usr/bin/env node
/**
 * Create (or reset) a back-office admin account.
 * ----------------------------------------------
 *   npm run create-admin -- --username admin --email admin@example.com --password 'YourPass123'
 *   ADMIN_USERNAME=admin ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD='YourPass123' npm run create-admin
 *
 * Why this exists instead of just an INSERT in seed.sql: a bcrypt hash
 * pasted into a .sql file is impossible to verify by reading it, and a
 * single wrong character produces an account that exists but can never log
 * in. Hashing here, at run time, means the password you type is provably
 * the password that works. Re-running it on an existing username resets
 * that account's password and reactivates it, which is also the recovery
 * path when someone is locked out.
 */
require('dotenv').config();

const bcrypt = require('bcryptjs');
const supabase = require('../src/config/supabase');

const BCRYPT_ROUNDS = 12;

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    const current = argv[i];
    if (!current.startsWith('--')) continue;
    const key = current.slice(2);
    const next = argv[i + 1];
    if (next && !next.startsWith('--')) {
      args[key] = next;
      i += 1;
    } else {
      args[key] = 'true';
    }
  }
  return args;
}

function validatePassword(password) {
  if (!password || password.length < 8) {
    return 'รหัสผ่านต้องยาวอย่างน้อย 8 ตัวอักษร';
  }
  if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
    return 'รหัสผ่านต้องมีทั้งตัวอักษรและตัวเลข';
  }
  return null;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  const username = (args.username || process.env.ADMIN_USERNAME || 'admin').trim().toLowerCase();
  const password = args.password || process.env.ADMIN_PASSWORD;
  const fullName = args['full-name'] || process.env.ADMIN_FULL_NAME || 'ผู้ดูแลระบบ (Admin)';
  const role = args.role || process.env.ADMIN_ROLE || 'owner';
  const phone = args.phone || process.env.ADMIN_PHONE || null;
  // The unified /login form (customers + staff) identifies an account by
  // email, so every staff account needs one. Falls back to a placeholder
  // so this script still works unattended, but pass --email for a real one.
  const email = (args.email || process.env.ADMIN_EMAIL || `${username}@phanacea.local`).trim().toLowerCase();

  if (!password) {
    console.error('\n❌ Missing password.\n');
    console.error("   npm run create-admin -- --username admin --password 'YourPass123'");
    console.error("   (or set ADMIN_PASSWORD in backend/.env)\n");
    process.exit(1);
  }

  const passwordError = validatePassword(password);
  if (passwordError) {
    console.error(`\n❌ ${passwordError}\n`);
    process.exit(1);
  }

  if (!['owner', 'pharmacist', 'assistant', 'staff'].includes(role)) {
    console.error('\n❌ role must be one of: owner, pharmacist, assistant, staff\n');
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

  const { data: existing, error: lookupError } = await supabase
    .from('staff')
    .select('id, username')
    .eq('username', username)
    .maybeSingle();

  if (lookupError) {
    console.error('\n❌ Could not reach the database:', lookupError.message);
    console.error('   Check SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in backend/.env\n');
    process.exit(1);
  }

  if (existing) {
    const { error } = await supabase
      .from('staff')
      .update({ password_hash: passwordHash, full_name: fullName, role, email, is_active: true })
      .eq('id', existing.id);

    if (error) {
      console.error('\n❌ Failed to update the account:', error.message, '\n');
      process.exit(1);
    }

    // Any session created with the old password stops working immediately.
    await supabase.from('staff_sessions').update({ is_valid: false }).eq('staff_id', existing.id);

    console.log(`\n✅ Updated existing account "${username}" (password reset, account re-activated).`);
  } else {
    const { error } = await supabase.from('staff').insert({
      username,
      email,
      password_hash: passwordHash,
      full_name: fullName,
      role,
      phone,
      is_active: true,
    });

    if (error) {
      console.error('\n❌ Failed to create the account:', error.message, '\n');
      process.exit(1);
    }

    console.log(`\n✅ Created admin account "${username}".`);
  }

  console.log(`   role:     ${role}`);
  console.log(`   name:     ${fullName}`);
  console.log(`   email:    ${email}`);
  console.log('   sign in:  http://localhost:5173/login\n');
  process.exit(0);
}

main().catch((err) => {
  console.error('\n❌ Unexpected error:', err);
  process.exit(1);
});
