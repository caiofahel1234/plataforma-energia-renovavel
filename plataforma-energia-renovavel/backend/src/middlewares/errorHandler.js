'use strict';
const logger = require('../config/logger');
const PG = { '23505': 409, '23503': 409, '22P02': 400, '22003': 400 };
const MSG = { 400: 'Requisição inválida', 401: 'Não autenticado', 403: 'Acesso negado', 404: 'Recurso não encontrado', 409: 'Conflito de dados', 502: 'Serviço externo indisponível', 413: 'Payload muito grande' };
// Usuário recebe mensagem genérica; detalhes técnicos (stack, SQL) ficam só no log do servidor
module.exports = (err, req, res, _next) => {
  const status = PG[err.code] || (err.status >= 400 && err.status < 500 ? err.status : err.status === 502 ? 502 : 500);
  logger.error({ err: { message: err.message, code: err.code, stack: err.stack }, reqId: req.id, path: req.path }, 'erro');
  res.status(status).json({ erro: status === 500 ? 'Erro interno do servidor' : (MSG[status] || 'Requisição inválida'), requestId: req.id });
};
