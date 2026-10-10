'use strict';
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const env = require('../config/env');
const allowed = env.CORS_ORIGINS.split(',').map(s => s.trim());

exports.helmetMw = helmet({
  // API só devolve JSON: CSP mais restritiva possível
  contentSecurityPolicy: { useDefaults: false, directives: { defaultSrc: ["'none'"], frameAncestors: ["'none'"], baseUri: ["'none'"], formAction: ["'none'"] } },
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
  frameguard: { action: 'deny' },
  referrerPolicy: { policy: 'no-referrer' },
});
// CORS: apenas origens autorizadas (lista em .env), com credenciais para o cookie httpOnly
exports.corsMw = cors({
  origin: (o, cb) => (!o || allowed.includes(o)) ? cb(null, true) : cb(Object.assign(new Error('CORS'), { status: 403 })),
  credentials: true, methods: ['GET', 'POST', 'PUT', 'DELETE'], allowedHeaders: ['Content-Type', 'X-CSRF-Token'], maxAge: 600,
});
const limiter = (windowMs, limit) => rateLimit({ windowMs, limit, standardHeaders: true, legacyHeaders: false, message: { erro: 'Muitas requisições. Tente mais tarde.' } });
exports.globalLimiter = limiter(15 * 60 * 1000, 300);
exports.loginLimiter = limiter(15 * 60 * 1000, 10);
