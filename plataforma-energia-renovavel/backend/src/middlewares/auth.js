'use strict';
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const env = require('../config/env');
const { audit } = require('./audit');
const SAFE = new Set(['GET', 'HEAD', 'OPTIONS']);
const eq = (a, b) => { const x = Buffer.from(String(a)), y = Buffer.from(String(b)); return x.length === y.length && crypto.timingSafeEqual(x, y); };

// A auditoria é AGUARDADA antes de responder: resposta enviada => evento já gravado (audit() nunca rejeita)
// JWT vem do cookie httpOnly; métodos que alteram estado exigem também o X-CSRF-Token (claim `csrf` do JWT)
exports.authenticate = async (req, res, next) => {
  const t = req.cookies && req.cookies.token;
  if (!t) return res.status(401).json({ erro: 'Não autenticado' });
  try {
    const p = jwt.verify(t, env.JWT_SECRET, { algorithms: ['HS256'], issuer: 'vse-api' });
    req.user = { id: Number(p.sub), papel: p.papel, csrf: p.csrf };
    if (!SAFE.has(req.method) && !eq(req.get('x-csrf-token') || '', p.csrf)) {
      await audit(req, 'CSRF_INVALIDO', { detalhes: { rota: req.method + ' ' + req.path } }); // tentativa de CSRF fica registrada
      return res.status(403).json({ erro: 'Acesso negado' });
    }
    next();
  } catch { return res.status(401).json({ erro: 'Não autenticado' }); }
};
// RBAC
exports.authorize = (...papeis) => async (req, res, next) => {
  if (papeis.includes(req.user.papel)) return next();
  await audit(req, 'ACESSO_NEGADO', { detalhes: { rota: req.method + ' ' + req.baseUrl } });
  res.status(403).json({ erro: 'Acesso negado' });
};
exports.cookieOpts = { httpOnly: true, secure: env.NODE_ENV === 'production', sameSite: 'strict', path: '/', maxAge: env.JWT_TTL_MIN * 60 * 1000 };
