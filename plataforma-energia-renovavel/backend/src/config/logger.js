'use strict';
const pino = require('pino');
module.exports = pino({
  level: process.env.NODE_ENV === 'test' ? 'silent' : 'info',
  // Nada sensível nos logs
  redact: { paths: ['req.headers.authorization', 'req.headers.cookie', '*.senha', '*.password', '*.token', '*.senha_hash', '*.csrf'], censor: '[REDACTED]' },
});
