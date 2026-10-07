import { describe, test, expect } from 'vitest'
import { pearson, matrizCorrelacao, parMaisForte, corrComCi } from '../utils/stats'
describe('Estatística do Pesquisador', () => {
  test('Pearson: correlação perfeita positiva, negativa e nula', () => { expect(pearson([1, 2, 3], [2, 4, 6])).toBeCloseTo(1); expect(pearson([1, 2, 3], [6, 4, 2])).toBeCloseTo(-1); expect(pearson([1, 1, 1], [1, 2, 3])).toBe(0) })
  const crit = [{ id: 'a' }, { id: 'b' }, { id: 'c' }]
  const munis = [1, 2, 3, 4].map(i => ({ values: { a: i, b: 2 * i, c: 10 - i * i } }))
  test('matriz simétrica com diagonal 1', () => { const M = matrizCorrelacao(munis, crit); for (let i = 0; i < 3; i++) { expect(M[i][i]).toBeCloseTo(1); for (let j = 0; j < 3; j++) expect(M[i][j]).toBeCloseTo(M[j][i]) } })
  test('par mais forte é A×B (r = 1)', () => { const p = parMaisForte(matrizCorrelacao(munis, crit)); expect([p.i, p.j]).toEqual([0, 1]); expect(p.r).toBeCloseTo(1) })
  test('correlação com Ci', () => expect(corrComCi(munis.map((m, i) => ({ ...m, ci: i / 3 })), crit)[0]).toBeCloseTo(1))
})
