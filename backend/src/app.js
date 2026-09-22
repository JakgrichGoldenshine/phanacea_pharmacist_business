const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const env = require('./config/env');
const { corsOptions } = require('./config/cors');
const routes = require('./routes');
const { apiLimiter } = require('./middlewares/rateLimiters');
const { errorHandler, notFound } = require('./middlewares/errorHandler');

// Fail at boot rather than silently signing production tokens with the
// well-known development secret — anyone who has read this repository
// could otherwise mint valid sessions.
if (env.isProduction && env.jwtSecret === 'dev-secret-change-me') {
  throw new Error('JWT_SECRET must be set to a unique value in production.');
}

const app = express();

// Vercel (and any other reverse proxy) puts the real client IP in
// X-Forwarded-For. Without this the rate limiters would see a single
// upstream IP for every visitor and throttle everyone together.
app.set('trust proxy', 1);

app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json({ limit: '1mb' }));
app.use(morgan(env.isProduction ? 'combined' : 'dev'));
app.use(apiLimiter);

app.use('/api', routes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
