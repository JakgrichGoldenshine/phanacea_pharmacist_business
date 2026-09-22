/**
 * Vercel serverless entry point.
 * ------------------------------
 * Vercel invokes the exported handler per request instead of running a
 * long-lived `listen()` server, and an Express app IS a (req, res) handler,
 * so it can be exported directly. backend/vercel.json rewrites every path
 * to this file while preserving the original URL, which is why the app's
 * internal '/api' prefix still matches.
 *
 * server.js stays the entry point for local development and any classic
 * Node host; nothing here changes how that works.
 */
const app = require('../src/app');

module.exports = app;
