/**
 * PHANACEA PHARMACIST BUSINESS — Product Launcher
 * ------------------------------------------------
 * Single entry point requested by the spec: run `node server.js` from the
 * project root and both the backend API and the frontend dev server start
 * together, with readable, color-coded logs.
 *
 * First-time setup:
 *   1. npm run setup                (installs backend + frontend deps)
 *   2. fill in backend/.env and frontend/.env (see docs/SETUP_GUIDE.md)
 *   3. npm start                    (or: node server.js)
 */
const path = require('path');
const fs = require('fs');
const concurrently = require('concurrently');

// This launcher spawns long-running local dev servers — it can never work
// as a Vercel serverless function (which must return a response, not stay
// running). The root of this repo IS a valid Vercel deploy target (see
// api/index.js + root vercel.json), but Vercel builds the frontend and
// invokes api/index.js directly — it never runs this file. Reaching this
// guard means something invoked `node server.js` / `npm start` on Vercel
// directly, which is always a misconfiguration. See docs/DEPLOYMENT.md.
if (process.env.VERCEL) {
  console.error(
    '\n❌ server.js (the local dev launcher) was invoked on Vercel. ' +
      'This file is for local development only — Vercel should build via ' +
      'root vercel.json and invoke api/index.js, not run this script. ' +
      'See docs/DEPLOYMENT.md.\n'
  );
  process.exit(1);
}

const root = __dirname;
const backendDir = path.join(root, 'backend');
const frontendDir = path.join(root, 'frontend');

function checkDeps(dir, label) {
  if (!fs.existsSync(path.join(dir, 'node_modules'))) {
    console.log(`\n⚠️  ${label} dependencies are not installed yet.`);
    console.log(`   Run: npm run setup\n`);
    process.exit(1);
  }
}

checkDeps(backendDir, 'Backend');
checkDeps(frontendDir, 'Frontend');

console.log('🌿 Starting PHANACEA (backend API + frontend)...\n');

concurrently(
  [
    {
      command: 'npm run dev',
      name: 'backend',
      cwd: backendDir,
      prefixColor: 'green',
    },
    {
      command: 'npm run dev',
      name: 'frontend',
      cwd: frontendDir,
      prefixColor: 'cyan',
    },
  ],
  {
    killOthers: ['failure', 'success'],
    restartTries: 0,
  }
).result.catch(() => {
  console.error('\n❌ PHANACEA stopped because one of the processes exited.');
  process.exit(1);
});
