'use strict';
const db = require('../config/db');
exports.inserir = ({ usuarioId, acao, entidade, entidadeId, ip, detalhes }) =>
  db.query('INSERT INTO audit_logs(usuario_id,acao,entidade,entidade_id,ip,detalhes) VALUES($1,$2,$3,$4,$5,$6)', [usuarioId, acao, entidade, entidadeId, ip, detalhes]);
exports.listar = async limite => (await db.query('SELECT id, ts, usuario_id, acao, entidade, entidade_id, ip, detalhes FROM audit_logs ORDER BY id DESC LIMIT $1', [limite])).rows;
