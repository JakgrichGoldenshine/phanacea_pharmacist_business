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
// running). Reaching this means the project's Root Directory is unset /
// pointed at the repo root instead of `backend` or `frontend`; the root
// vercel.json is supposed to catch this at build time already (see
// docs/DEPLOYMENT.md), so this is a second guard in case that's bypassed.
if (process.env.VERCEL) {
  console.error(
    '\n❌ server.js (the local dev launcher) was invoked on Vercel. ' +
      'Set this project\'s Root Directory to "backend" or "frontend" ' +
      'in Settings -> General -- deploy those two folders as separate ' +
      'Vercel projects, not the repo root. See docs/DEPLOYMENT.md.\n'
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
