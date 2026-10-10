'use strict';
const db = require('../config/db');
const SEL = "SELECT id, nome, descricao, CASE tipo WHEN 'beneficio' THEN 'benefit' ELSE 'cost' END AS type, unidade AS unit, peso::float8 AS weight FROM criterios";
exports.listar = async () => (await db.query(SEL + ' ORDER BY id')).rows;
exports.criar = async c => (await db.query('INSERT INTO criterios(nome,descricao,tipo,unidade,peso) VALUES($1,$2,$3,$4,$5) RETURNING id', [c.nome, c.descricao ?? null, c.tipo, c.unidade ?? null, c.peso])).rows[0].id;
exports.obter = async id => (await db.query('SELECT nome, tipo, peso::float8 AS peso FROM criterios WHERE id = $1', [id])).rows[0];
exports.atualizar = (id, c) => db.query('UPDATE criterios SET nome=COALESCE($2,nome), descricao=COALESCE($3,descricao), tipo=COALESCE($4,tipo), unidade=COALESCE($5,unidade), peso=COALESCE($6,peso) WHERE id=$1',
  [id, c.nome ?? null, c.descricao ?? null, c.tipo ?? null, c.unidade ?? null, c.peso ?? null]);
exports.excluir = async id => (await db.query('DELETE FROM criterios WHERE id = $1', [id])).rowCount > 0;
exports.parametrosPorIds = async ids => (await db.query('SELECT id, nome, tipo, peso::float8 AS peso FROM criterios WHERE id = ANY($1::int[])', [ids])).rows;
