const { senhaForte, usuarioSchema, municipioSchema, topsisSchema } = require('../src/schemas');
const { csvCell } = require('../src/utils/csv');
describe('Política de senha', () => {
  test.each(['curta1!A', 'semmaiuscula1!aaaa', 'SEMMINUSCULA1!AAAA', 'SemNumeroSimbolo!!!!', 'SemSimbolo12345abc'])('rejeita %s', s => expect(senhaForte.safeParse(s).success).toBe(false));
  test('aceita senha forte', () => expect(senhaForte.safeParse('Senh@Forte-2026x').success).toBe(true));
});
describe('Sanitização / validação', () => {
  test('rejeita marcação HTML no nome', () => expect(usuarioSchema.safeParse({ nome: '<script>x</script>', email: 'a@b.co', papel: 'admin', senha: 'Senh@Forte-2026x' }).success).toBe(false));
  test('rejeita campos extras (mass assignment)', () => expect(usuarioSchema.safeParse({ nome: 'Ana', email: 'a@b.co', papel: 'admin', senha: 'Senh@Forte-2026x', ativo: true }).success).toBe(false));
  test('rejeita papel inválido', () => expect(usuarioSchema.safeParse({ nome: 'Ana', email: 'a@b.co', papel: 'root', senha: 'Senh@Forte-2026x' }).success).toBe(false));
  test('rejeita coordenadas fora do intervalo', () => expect(municipioSchema.safeParse({ nome: 'X', uf: 'BA', populacao: 1, lat: 200, lng: 0 }).success).toBe(false));
  test('rejeita UF minúscula/inválida', () => expect(municipioSchema.safeParse({ nome: 'Xa', uf: 'b1', populacao: 1, lat: 0, lng: 0 }).success).toBe(false));
  test('TOPSIS exige >= 2 critérios', () => expect(topsisSchema.safeParse({ criterios: [{ id: 1, tipo: 'custo', peso: 1 }] }).success).toBe(false));
});
describe('CSV injection', () => {
  test.each(['=1+1', '+cmd', '-2+3', '@SUM(A1)'])('neutraliza %s', v => expect(csvCell(v).startsWith("'")).toBe(true));
});

describe('Schemas RF08/RF09', () => {
  test('aceita atualização parcial de usuário sem mass assignment', () => {
    expect(require('../src/schemas').usuarioAtualizacaoSchema.safeParse({ papel: 'pesquisador', ativo: false }).success).toBe(true);
    expect(require('../src/schemas').usuarioAtualizacaoSchema.safeParse({ senha: 'x' }).success).toBe(false);
  });
  test('valida código IBGE/ANEEL com 7 dígitos', () => {
    const { aneelParam, ibgeParam } = require('../src/schemas');
    expect(aneelParam.safeParse({ codigo: '2927408' }).success).toBe(true);
    expect(aneelParam.safeParse({ codigo: '123' }).success).toBe(false);
    expect(ibgeParam.safeParse({ codigo: '2927408' }).success).toBe(true);
  });
});
