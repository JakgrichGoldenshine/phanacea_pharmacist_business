/**
 * Vercel serverless entry point for the combined single-project deployment
 * (Root Directory left empty / pointed at the repo root — see
 * docs/DEPLOYMENT.md). Root vercel.json rewrites every /api/* request here
 * while preserving the original URL, so the Express app's internal '/api'
 * prefix still matches.
 */
const app = require('../backend/src/app');

module.exports = app;
