'use strict';
const db = require('../config/db');
// Matriz de decisão: valor mais recente por (município, critério)
exports.listarMatriz = async () => (await db.query(`
  WITH ult AS (SELECT DISTINCT ON (municipio_id, criterio_id) municipio_id, criterio_id, valor
               FROM matriz_decisao ORDER BY municipio_id, criterio_id, ano_referencia DESC NULLS LAST)
  SELECT m.id, m.nome, m.uf, m.populacao, m.idh::float8 AS idh, ST_Y(m.coordenadas) AS lat, ST_X(m.coordenadas) AS lng,
         COALESCE(jsonb_object_agg(u.criterio_id::text, u.valor::float8) FILTER (WHERE u.criterio_id IS NOT NULL), '{}') AS values
  FROM municipios m LEFT JOIN ult u ON u.municipio_id = m.id GROUP BY m.id ORDER BY m.nome`)).rows;
exports.criar = async ({ nome, uf, populacao, idh, lat, lng, values }) => {
  const c = await db.connect();
  try {
    await c.query('BEGIN');
    const { rows: [m] } = await c.query('INSERT INTO municipios(nome,uf,populacao,idh,coordenadas) VALUES($1,$2,$3,$4,ST_SetSRID(ST_MakePoint($5,$6),4326)) RETURNING id', [nome, uf, populacao, idh ?? null, lng, lat]);
    const ids = Object.keys(values).map(Number);
    if (ids.length) await c.query('INSERT INTO matriz_decisao(municipio_id,criterio_id,valor,ano_referencia) SELECT $1, k, v, EXTRACT(YEAR FROM NOW())::int FROM unnest($2::int[], $3::float8[]) AS t(k, v)', [m.id, ids, ids.map(i => values[String(i)])]);
    await c.query('COMMIT');
    return m.id;
  } catch (e) { await c.query('ROLLBACK'); throw e; } finally { c.release(); }
};
exports.excluir = async id => (await db.query('DELETE FROM municipios WHERE id = $1', [id])).rowCount > 0;
