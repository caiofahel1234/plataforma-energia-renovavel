import { api, API_ON } from './api'
// Algoritmo TOPSIS em JS puro (fallback offline). Mesmo cálculo do backend.
export function topsis(munis, criteria) {
  const wSum = criteria.reduce((s, c) => s + Number(c.weight), 0) || 1
  const w = criteria.map(c => c.weight / wSum)
  const norm = criteria.map(c => Math.sqrt(munis.reduce((s, x) => s + x.values[c.id] ** 2, 0)) || 1)
  const V = munis.map(x => criteria.map((c, j) => (x.values[c.id] / norm[j]) * w[j]))
  const col = j => V.map(r => r[j])
  const best = criteria.map((c, j) => (c.type === 'benefit' ? Math.max(...col(j)) : Math.min(...col(j))))
  const worst = criteria.map((c, j) => (c.type === 'benefit' ? Math.min(...col(j)) : Math.max(...col(j))))
  const rng = criteria.map(c => { const a = munis.map(x => x.values[c.id]); return [Math.min(...a), Math.max(...a)] })
  const rows = munis.map((x, i) => {
    const dPlus = Math.sqrt(V[i].reduce((s, v, j) => s + (v - best[j]) ** 2, 0))
    const dMinus = Math.sqrt(V[i].reduce((s, v, j) => s + (v - worst[j]) ** 2, 0))
    const scores = criteria.map((c, j) => { const [lo, hi] = rng[j]; const t = hi === lo ? 1 : (x.values[c.id] - lo) / (hi - lo); return c.type === 'benefit' ? t : 1 - t })
    return { id: x.id, nome: x.nome, uf: x.uf, lat: x.lat, lng: x.lng, values: x.values, dPlus, dMinus,
      ci: dPlus + dMinus === 0 ? 0 : dMinus / (dPlus + dMinus), scores, critico: criteria[scores.indexOf(Math.min(...scores))].nome }
  })
  return rows.sort((a, b) => b.ci - a.ci).map((r, i) => ({ ...r, pos: i + 1 }))
}
export async function calcular(munis, criteria, ids) {
  if (API_ON) {
    try {
      const d = await api('/topsis/executar', { method: 'POST', body: { criterios: criteria.map(c => ({ id: Number(c.id), tipo: c.type === 'benefit' ? 'beneficio' : 'custo', peso: c.weight / 100 })), ...(ids ? { municipioIds: ids.map(Number) } : {}) } })
      return { ranking: d.ranking, source: 'API', simulacaoId: d.simulacaoId }
    } catch (e) { if (e.status) throw e /* 4xx/5xx: não contorna autorização */ }
    // sem resposta (API offline): fallback local
  }
  await new Promise(r => setTimeout(r, 400))
  return { ranking: topsis(ids ? munis.filter(m => ids.includes(m.id)) : munis, criteria), source: 'local' }
}
