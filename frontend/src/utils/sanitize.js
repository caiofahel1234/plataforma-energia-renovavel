// Sanitização client-side (defesa em profundidade; o servidor valida de novo). React já escapa saídas.
export const limpa = s => String(s ?? '').replace(/[\u0000-\u001f\u007f<>"`\\]/g, '').trim().slice(0, 120)
const num = (v, min, max) => { const n = Number(v); return v !== '' && v !== null && Number.isFinite(n) && n >= min && n <= max ? n : null }
export const senhaForte = s => s.length >= 12 && s.length <= 72 && /[a-z]/.test(s) && /[A-Z]/.test(s) && /\d/.test(s) && /[^A-Za-z0-9]/.test(s)
// Valida e saneia um município vindo de formulário/arquivo. Retorna null se inválido.
export function municipioSeguro(m, criterioIds) {
  if (!m || typeof m !== 'object') return null
  const nome = limpa(m.nome), uf = limpa(m.uf).toUpperCase()
  const populacao = num(m.populacao, 0, 2e8), lat = num(m.lat, -90, 90), lng = num(m.lng, -180, 180)
  const idh = m.idh === '' || m.idh == null ? null : num(m.idh, 0, 1)
  if (nome.length < 2 || !/^[A-Z]{2}$/.test(uf) || populacao === null || lat === null || lng === null) return null
  const values = {}
  for (const id of criterioIds) { const v = num(m.values?.[id], -1e12, 1e12); if (v === null) return null; values[id] = v }
  return { id: Date.now() + Math.random(), nome, uf, populacao: Math.round(populacao), idh, lat, lng, values }
}
