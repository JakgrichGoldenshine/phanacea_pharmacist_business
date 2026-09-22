const app = require('./src/app');
const env = require('./src/config/env');

const server = app.listen(env.port, () => {
  // eslint-disable-next-line no-console
  console.log(`🌿 PHANACEA API listening on http://localhost:${env.port}`);
});

// Without this handler, a taken port crashes the process with a raw,
// confusing Node stack trace. Fail loudly but usefully instead — tell the
// person exactly what happened and how to fix it.
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n❌ Port ${env.port} is already in use — another process is listening on it.\n`);
    console.error('Fix it one of two ways:\n');
    console.error(`  1) Free the port (find & stop whatever is using ${env.port}):`);
    console.error(`     Windows (PowerShell):`);
    console.error(`       Get-Process -Id (Get-NetTCPConnection -LocalPort ${env.port} -State Listen).OwningProcess`);
    console.error(`       Stop-Process -Id <PID_FROM_ABOVE> -Force`);
    console.error(`     macOS / Linux:`);
    console.error(`       lsof -i :${env.port}`);
    console.error(`       kill -9 <PID_FROM_ABOVE>\n`);
    console.error(`  2) Or just use a different port — edit backend/.env:`);
    console.error(`       PORT=4001`);
    console.error(`     (and update VITE_API_BASE_URL in frontend/.env to match, e.g.`);
    console.error(`      http://localhost:4001/api)\n`);
    process.exit(1);
  }

  if (err.code === 'EACCES') {
    console.error(`\n❌ Permission denied binding to port ${env.port}.`);
    console.error(`   Ports below 1024 need admin/root privileges — use a port like 4000+ instead.\n`);
    process.exit(1);
  }

  // eslint-disable-next-line no-console
  console.error('\n❌ Failed to start the server:', err);
  process.exit(1);
});
