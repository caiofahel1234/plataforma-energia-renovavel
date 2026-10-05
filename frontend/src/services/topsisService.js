// Algoritmo TOPSIS em JS puro (fallback offline) + chamada opcional à API
export function topsis(munis, criteria) {
  const wSum = criteria.reduce((s, c) => s + Number(c.weight), 0) || 1
  const w = criteria.map(c => c.weight / wSum)
  // 1) normalização vetorial  2) ponderação
  const norm = criteria.map(c => Math.sqrt(munis.reduce((s, x) => s + x.values[c.id] ** 2, 0)) || 1)
  const V = munis.map(x => criteria.map((c, j) => (x.values[c.id] / norm[j]) * w[j]))
  // 3) soluções ideal (A+) e anti-ideal (A-)
  const col = j => V.map(r => r[j])
  const best = criteria.map((c, j) => (c.type === 'benefit' ? Math.max(...col(j)) : Math.min(...col(j))))
  const worst = criteria.map((c, j) => (c.type === 'benefit' ? Math.min(...col(j)) : Math.max(...col(j))))
  // escore 0-1 por critério (1 = ideal): usado no radar e no indicador crítico
  const rng = criteria.map(c => { const a = munis.map(x => x.values[c.id]); return [Math.min(...a), Math.max(...a)] })
  const rows = munis.map((x, i) => {
    // 4) distâncias euclidianas  5) coeficiente de proximidade
    const dPlus = Math.sqrt(V[i].reduce((s, v, j) => s + (v - best[j]) ** 2, 0))
    const dMinus = Math.sqrt(V[i].reduce((s, v, j) => s + (v - worst[j]) ** 2, 0))
    const scores = criteria.map((c, j) => {
      const [lo, hi] = rng[j]; const t = hi === lo ? 1 : (x.values[c.id] - lo) / (hi - lo)
      return c.type === 'benefit' ? t : 1 - t
    })
    const k = scores.indexOf(Math.min(...scores))
    return { id: x.id, nome: x.nome, uf: x.uf, lat: x.lat, lng: x.lng, values: x.values, dPlus, dMinus,
      ci: dPlus + dMinus === 0 ? 0 : dMinus / (dPlus + dMinus), scores, critico: criteria[k].nome, criticoId: criteria[k].id }
  })
  return rows.sort((a, b) => b.ci - a.ci).map((r, i) => ({ ...r, pos: i + 1 }))
}

const API = import.meta.env.VITE_API_URL
export async function calcular(munis, criteria) {
  if (API) {
    try {
      const r = await fetch(`${API}/topsis`, { method: 'POST', signal: AbortSignal.timeout(4000),
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ municipios: munis, criterios: criteria }) })
      if (r.ok) return { ranking: (await r.json()).ranking, source: 'API' }
    } catch { /* API offline -> fallback local */ }
  }
  await new Promise(r => setTimeout(r, 600)) // simula latência para exibir o loader
  return { ranking: topsis(munis, criteria), source: 'local' }
}
