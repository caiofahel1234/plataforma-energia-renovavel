import { describe, test, expect } from 'vitest'
import { topsis } from '../services/topsisService'
import { limpa, municipioSeguro, senhaForte } from '../utils/sanitize'
const crit = [['custo', 20], ['benefit', 20], ['benefit', 15], ['custo', 25], ['benefit', 20]].map(([t, w], i) => ({ id: 'c' + (i + 1), nome: 'C' + (i + 1), type: t === 'custo' ? 'cost' : 'benefit', weight: w }))
const mk = (id, nome, v) => ({ id, nome, uf: 'BA', lat: 0, lng: 0, values: Object.fromEntries(v.map((x, i) => ['c' + (i + 1), x])) })
const munis = [mk(1, 'A', [15, 0.8, 980, 0.75, 5.2]), mk(2, 'B', [5, 2.1, 1850, 0.62, 5.8]), mk(3, 'C', [22, 0.3, 650, 0.89, 4.9])]

describe('TOPSIS (fallback do front) – Cap. 7.3', () => {
  test('exemplo numérico: B > A > C', () => expect(topsis(munis, crit).map(r => r.nome)).toEqual(['B', 'A', 'C']))
  test('Ci entre 0 e 1 e posições sequenciais', () => { const r = topsis(munis, crit); r.forEach(x => { expect(x.ci).toBeGreaterThanOrEqual(0); expect(x.ci).toBeLessThanOrEqual(1) }); expect(r.map(x => x.pos)).toEqual([1, 2, 3]) })
  test('escores do radar em [0,1] e indicador crítico definido', () => topsis(munis, crit).forEach(r => { r.scores.forEach(s => { expect(s).toBeGreaterThanOrEqual(0); expect(s).toBeLessThanOrEqual(1) }); expect(typeof r.critico).toBe('string') }))
})
describe('Sanitização e validação (client-side)', () => {
  test('remove marcação HTML', () => expect(limpa('<img src=x onerror=1>Ana')).toBe('img src=x onerror=1Ana'))
  test('município válido e inválidos', () => {
    expect(municipioSeguro({ nome: 'Ilhéus', uf: 'ba', populacao: 10, lat: -14, lng: -39, values: { c1: 1 } }, ['c1'])).toMatchObject({ uf: 'BA' })
    expect(municipioSeguro({ nome: 'X', uf: 'BA', populacao: 10, lat: -14, lng: -39, values: { c1: 1 } }, ['c1'])).toBeNull()
    expect(municipioSeguro({ nome: 'Ilhéus', uf: 'BA', populacao: 10, lat: 99, lng: -39, values: { c1: 1 } }, ['c1'])).toBeNull()
    expect(municipioSeguro({ nome: 'Ilhéus', uf: 'BA', populacao: 10, lat: 1, lng: 1, values: {} }, ['c1'])).toBeNull()
  })
  test('política de senha', () => { expect(senhaForte('Senh@Forte-2026x')).toBe(true); expect(senhaForte('fraca123')).toBe(false) })
})
