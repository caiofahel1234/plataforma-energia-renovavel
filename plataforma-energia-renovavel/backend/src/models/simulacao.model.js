'use strict';
const db = require('../config/db');
// salvarSimulacao: chamado pelo TopsisService (diagrama de sequência 4.3)
exports.salvarSimulacao = async ({ usuarioId, parametros, ranking }) => {
  const c = await db.connect();
  try {
    await c.query('BEGIN');
    const { rows: [s] } = await c.query('INSERT INTO simulacoes(usuario_id, parametros) VALUES($1,$2) RETURNING id', [usuarioId, parametros]);
    await c.query(`INSERT INTO resultados_ranking(simulacao_id,municipio_id,coeficiente_ci,distancia_positiva,distancia_negativa,posicao)
      SELECT $1, * FROM unnest($2::int[], $3::float8[], $4::float8[], $5::float8[], $6::int[])`,
      [s.id, ranking.map(r => r.id), ranking.map(r => r.ci), ranking.map(r => r.dPlus), ranking.map(r => r.dMinus), ranking.map(r => r.pos)]);
    await c.query('COMMIT');
    return s.id;
  } catch (e) { await c.query('ROLLBACK'); throw e; } finally { c.release(); }
};
exports.listar = async ({ admin, usuarioId }) => (await db.query("SELECT id, data_execucao, parametros - 'extras' AS parametros FROM simulacoes WHERE ($1::boolean OR usuario_id = $2) ORDER BY data_execucao DESC LIMIT 50", [admin, usuarioId])).rows;
// Autorização por objeto (anti-IDOR): dono ou admin; senão null => 404
exports.obter = async (id, user) => {
  const { rows: [s] } = await db.query('SELECT id, usuario_id, data_execucao, parametros FROM simulacoes WHERE id = $1', [id]);
  if (!s || (user.papel !== 'admin' && s.usuario_id !== user.id)) return null;
  const { rows } = await db.query(`SELECT r.municipio_id AS id, m.nome, m.uf, ST_Y(m.coordenadas) AS lat, ST_X(m.coordenadas) AS lng,
      r.coeficiente_ci AS ci, r.distancia_positiva AS "dPlus", r.distancia_negativa AS "dMinus", r.posicao AS pos
    FROM resultados_ranking r JOIN municipios m ON m.id = r.municipio_id WHERE r.simulacao_id = $1 ORDER BY r.posicao`, [id]);
  const ex = (s.parametros && s.parametros.extras) || {};
  const ranking = rows.map(r => ({ ...r, ci: +r.ci, dPlus: +r.dPlus, dMinus: +r.dMinus, lat: +r.lat, lng: +r.lng, ...(ex[r.id] || { scores: [], critico: '', values: {} }) }));
  return { id: s.id, data: s.data_execucao, parametros: s.parametros, ranking };
};
