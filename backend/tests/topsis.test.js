const { normalizar, topsis, executar } = require('../src/services/topsis.service');
describe('TOPSIS Service', () => {
  test('normalização vetorial preserva proporções', () => { const r = normalizar([3, 4]); expect(r[0]).toBeCloseTo(0.6); expect(r[1]).toBeCloseTo(0.8); });
  test('exemplo numérico do Cap. 7.3: B > A > C', () => {
    const matriz = [[15, 0.8, 980, 0.75, 5.2], [5, 2.1, 1850, 0.62, 5.8], [22, 0.3, 650, 0.89, 4.9]];
    const r = topsis(matriz, [0.2, 0.2, 0.15, 0.25, 0.2], ['custo', 'beneficio', 'beneficio', 'custo', 'beneficio']);
    expect(r.map(x => 'ABC'[x.indice]).join('>')).toBe('B>A>C');
    r.forEach(x => { expect(x.ci).toBeGreaterThanOrEqual(0); expect(x.ci).toBeLessThanOrEqual(1); });
  });
  test('RNF01: 500 alternativas em < 3s e sem NaN', () => {
    const munis = Array.from({ length: 500 }, (_, i) => ({ id: i, nome: 'M' + i, uf: 'BA', lat: 0, lng: 0, values: Object.fromEntries([1, 2, 3, 4, 5, 6, 7].map(c => [c, Math.random() * 100])) }));
    const crit = [1, 2, 3, 4, 5, 6, 7].map(id => ({ id, nome: 'C' + id, tipo: id % 2 ? 'custo' : 'beneficio', peso: 1 / 7 }));
    const t = Date.now(); const r = executar(munis, crit);
    expect(Date.now() - t).toBeLessThan(3000); expect(r).toHaveLength(500); r.forEach(x => expect(Number.isNaN(x.ci)).toBe(false));
  });
  test('coluna zerada não gera NaN', () => { topsis([[0, 1], [0, 2]], [0.5, 0.5], ['custo', 'beneficio']).forEach(x => expect(Number.isNaN(x.ci)).toBe(false)); });
});
