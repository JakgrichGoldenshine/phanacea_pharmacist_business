const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const env = require('../config/env');

function signToken(payload) {
  return jwt.sign(payload, env.jwtSecret, { expiresIn: env.jwtExpiresIn });
}

function verifyToken(token) {
  return jwt.verify(token, env.jwtSecret);
}

// Sessions are stored hashed (SHA-256) in user_sessions — never store the
// raw JWT in the database, mirroring the spec's session_token note.
function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

module.exports = { signToken, verifyToken, hashToken };
