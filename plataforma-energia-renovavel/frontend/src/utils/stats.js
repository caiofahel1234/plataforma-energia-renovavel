// Estatística para o perfil Pesquisador ("analisar correlações entre indicadores" – Cap. 3)
const avg = a => a.reduce((s, v) => s + v, 0) / a.length
export function pearson(x, y) {
  const mx = avg(x), my = avg(y); let sxy = 0, sxx = 0, syy = 0
  for (let i = 0; i < x.length; i++) { sxy += (x[i] - mx) * (y[i] - my); sxx += (x[i] - mx) ** 2; syy += (y[i] - my) ** 2 }
  const d = Math.sqrt(sxx * syy); return d === 0 ? 0 : sxy / d
}
// Matriz de correlação entre critérios (colunas da matriz de decisão)
export function matrizCorrelacao(munis, criteria) {
  const cols = criteria.map(c => munis.map(m => Number(m.values[c.id]) || 0))
  return cols.map(a => cols.map(b => pearson(a, b)))
}
// Correlação de cada critério com o coeficiente Ci
export const corrComCi = (ranking, criteria) => criteria.map(c => pearson(ranking.map(r => Number(r.values[c.id]) || 0), ranking.map(r => r.ci)))
// Par de critérios (i<j) com maior |r|
export function parMaisForte(M) {
  let best = null
  for (let i = 0; i < M.length; i++) for (let j = i + 1; j < M.length; j++) if (!best || Math.abs(M[i][j]) > Math.abs(best.r)) best = { i, j, r: M[i][j] }
  return best
}
// Verde = correlação positiva, vermelho = negativa; intensidade = |r|
export const corCorr = r => r >= 0 ? `rgba(16,185,129,${0.12 + 0.75 * r})` : `rgba(239,68,68,${0.12 + 0.75 * -r})`
