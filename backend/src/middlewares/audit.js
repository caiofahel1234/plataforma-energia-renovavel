'use strict';
const crypto = require('crypto');
const auditModel = require('../models/audit.model');
const logger = require('../config/logger');
const SENSITIVE = /senha|password|token|secret|hash|cookie|authorization|csrf/i;
const scrub = o => Array.isArray(o) ? o.map(scrub)
  : o && typeof o === 'object' ? Object.fromEntries(Object.entries(o).filter(([k]) => !SENSITIVE.test(k)).map(([k, v]) => [k, scrub(v)])) : o;
// Log de auditoria (autenticação, parâmetros TOPSIS, exclusões...) sem dados sensíveis
exports.audit = (req, acao, { entidade = null, entidadeId = null, usuarioId = req.user ? req.user.id : null, detalhes = {} } = {}) => {
  logger.info({ audit: true, acao, entidade, entidadeId, usuarioId, reqId: req.id, ip: req.ip }, 'audit');
  return auditModel.inserir({ usuarioId, acao, entidade, entidadeId: entidadeId === null ? null : String(entidadeId), ip: req.ip, detalhes: scrub(detalhes) })
    .catch(e => logger.error({ code: e.code }, 'falha ao gravar auditoria'));
};
exports.hashId = v => crypto.createHash('sha256').update(String(v).toLowerCase()).digest('hex').slice(0, 16); // não registra e-mail em claro
