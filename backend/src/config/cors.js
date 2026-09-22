const env = require('./env');

// Origins are configured as a comma-separated list so the same build can
// serve local development and one or more deployed frontends without code
// changes (FRONTEND_URL=https://shop.vercel.app,https://www.phanacea.com).
const allowList = env.frontendUrls;

// Vercel gives every pull request its own preview hostname, which cannot
// be known ahead of time. Matching the project's own preview pattern keeps
// previews usable without opening CORS to the entire internet.
const previewPattern = env.vercelPreviewPattern ? new RegExp(env.vercelPreviewPattern) : null;

function isAllowed(origin) {
  if (allowList.includes(origin)) return true;
  if (previewPattern && previewPattern.test(origin)) return true;
  return false;
}

const corsOptions = {
  origin(origin, callback) {
    // Same-origin requests, curl and server-to-server calls send no Origin
    // header at all — those are not browser cross-origin requests, so
    // there is nothing for CORS to protect against.
    if (!origin) return callback(null, true);

    if (isAllowed(origin)) return callback(null, true);

    // eslint-disable-next-line no-console
    console.warn(`[cors] blocked origin: ${origin}`);
    return callback(null, false);
  },
  credentials: true,
};

module.exports = { corsOptions, isAllowed };
