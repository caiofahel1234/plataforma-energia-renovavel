'use strict';
// TOPSIS (Cap. 7.2). Maior Ci = menos vulnerável.
const norm = v => { const n = Math.sqrt(v.reduce((s, x) => s + x * x, 0)); return v.map(x => (n === 0 ? 0 : x / n)); };
// Aceita vetor (ex.: [3,4] -> [0.6,0.8]) ou matriz (normaliza por coluna)
function normalizar(m) {
  if (typeof m[0] === 'number') return norm(m);
  const cols = m[0].map((_, j) => norm(m.map(r => r[j])));
  return m.map((_, i) => cols.map(c => c[i]));
}
function calcular(matriz, pesos, tipos) {
  const pond = normalizar(matriz).map(r => r.map((v, j) => v * pesos[j]));
  const col = j => pond.map(r => r[j]);
  const ben = j => tipos[j] === 'beneficio';
  const Aplus = pesos.map((_, j) => ben(j) ? Math.max(...col(j)) : Math.min(...col(j)));
  const Aminus = pesos.map((_, j) => ben(j) ? Math.min(...col(j)) : Math.max(...col(j)));
  const dist = ref => pond.map(r => Math.sqrt(r.reduce((s, v, j) => s + (v - ref[j]) ** 2, 0)));
  const Dplus = dist(Aplus), Dminus = dist(Aminus);
  const Ci = Dplus.map((dp, i) => (dp + Dminus[i] === 0 ? 0 : Dminus[i] / (dp + Dminus[i])));
  return { Ci, Dplus, Dminus };
}
const topsis = (matriz, pesos, tipos) => calcular(matriz, pesos, tipos).Ci.map((ci, indice) => ({ indice, ci })).sort((a, b) => b.ci - a.ci);

// munis: [{id,nome,uf,lat,lng,values:{[criterioId]:n}}]; criterios: [{id,nome,tipo,peso}]
function executar(munis, criterios) {
  const matriz = munis.map(m => criterios.map(c => m.values[c.id]));
  const { Ci, Dplus, Dminus } = calcular(matriz, criterios.map(c => c.peso), criterios.map(c => c.tipo));
  const rng = criterios.map((_, j) => { const a = matriz.map(r => r[j]); return [Math.min(...a), Math.max(...a)]; });
  const rows = munis.map((m, i) => {
    const scores = criterios.map((c, j) => { const [lo, hi] = rng[j]; const t = hi === lo ? 1 : (matriz[i][j] - lo) / (hi - lo); return c.tipo === 'beneficio' ? t : 1 - t; });
    return { id: m.id, nome: m.nome, uf: m.uf, lat: m.lat, lng: m.lng, values: m.values, dPlus: Dplus[i], dMinus: Dminus[i], ci: Ci[i], scores, critico: criterios[scores.indexOf(Math.min(...scores))].nome };
  });
  return rows.sort((a, b) => b.ci - a.ci).map((r, i) => ({ ...r, pos: i + 1 }));
}
// Orquestra o cálculo e persiste (Diagrama 4.3: TopsisService -> BD: salvarSimulacao). `repo` é injetado => serviço testável.
async function executarESalvar({ repo, usuarioId, criterios, munis }) {
  const ranking = executar(munis, criterios);
  const extras = Object.fromEntries(ranking.map(r => [r.id, { scores: r.scores, critico: r.critico, values: r.values }]));
  const parametros = { criterios: criterios.map(c => ({ id: c.id, tipo: c.tipo, peso: c.peso })), top: ranking[0].nome, extras };
  const simulacaoId = await repo.salvarSimulacao({ usuarioId, parametros, ranking });
  return { simulacaoId, ranking };
}
module.exports = { normalizar, calcular, topsis, executar, executarESalvar };
