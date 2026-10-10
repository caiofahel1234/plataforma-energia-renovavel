// Testes de integração da API (Supertest) com a camada de dados simulada
jest.mock('../src/models/usuario.model'); jest.mock('../src/models/criterio.model'); jest.mock('../src/models/municipio.model');
jest.mock('../src/models/simulacao.model'); jest.mock('../src/models/audit.model');
jest.mock('../src/config/db', () => ({ query: jest.fn().mockResolvedValue({ rows: [{ ok: 1 }] }) }));
const request = require('supertest'), bcrypt = require('bcrypt');
const app = require('../src/app');
const usuarios = require('../src/models/usuario.model'), criterios = require('../src/models/criterio.model'), municipios = require('../src/models/municipio.model');
const simulacoes = require('../src/models/simulacao.model'), auditModel = require('../src/models/audit.model');
const { sessao, como } = require('./helpers');
const asyncAuditOk = () => auditModel.inserir.mockResolvedValue();
beforeEach(() => { jest.resetAllMocks(); asyncAuditOk(); });
const acoes = () => auditModel.inserir.mock.calls.map(c => c[0].acao);

describe('Segurança de transporte e cabeçalhos', () => {
  test('cabeçalhos de segurança e sem x-powered-by', async () => {
    const r = await request(app).get('/api/health');
    expect(r.status).toBe(200); expect(r.headers['content-security-policy']).toMatch(/default-src 'none'/);
    expect(r.headers['strict-transport-security']).toMatch(/max-age=31536000/); expect(r.headers['x-frame-options']).toBe('DENY');
    expect(r.headers['x-powered-by']).toBeUndefined(); expect(r.headers['cache-control']).toBe('no-store');
  });
  test('CORS: origem não autorizada é bloqueada; autorizada recebe credenciais', async () => {
    expect((await request(app).get('/api/health').set('Origin', 'http://evil.com')).status).toBe(403);
    const ok = await request(app).get('/api/health').set('Origin', 'http://localhost:5173');
    expect(ok.headers['access-control-allow-origin']).toBe('http://localhost:5173'); expect(ok.headers['access-control-allow-credentials']).toBe('true');
  });
  test('rota inexistente e JSON malformado => mensagens genéricas', async () => {
    expect((await request(app).get('/api/nada')).body.erro).toBe('Recurso não encontrado');
    const r = await request(app).post('/api/auth/login').set('Content-Type', 'application/json').send('{bad');
    expect(r.status).toBe(400); expect(JSON.stringify(r.body)).not.toMatch(/Unexpected|JSON|stack/i);
  });
  test('Swagger UI disponível com CSP própria', async () => {
    const r = await request(app).get('/api/docs/'); expect(r.status).toBe(200); expect(r.headers['content-security-policy']).toMatch(/script-src 'self'/);
  });
});

describe('Autenticação (RNF04)', () => {
  const hash = bcrypt.hashSync('Senh@Forte-2026x', 10);
  const user = { id: 7, nome: 'Ana', email: 'ana@x.com', papel: 'pesquisador', senha_hash: hash, ativo: true, bloqueado_ate: null };
  test('login válido: cookie httpOnly + SameSite=Strict, token fora do corpo, csrf no corpo', async () => {
    usuarios.buscarPorEmail.mockResolvedValue(user); usuarios.zerarFalhas.mockResolvedValue();
    const r = await request(app).post('/api/auth/login').send({ email: 'ANA@x.com', senha: 'Senh@Forte-2026x' });
    expect(r.status).toBe(200); const c = r.headers['set-cookie'][0];
    expect(c).toMatch(/token=/); expect(c).toMatch(/HttpOnly/i); expect(c).toMatch(/SameSite=Strict/i);
    expect(r.body.csrf).toHaveLength(48); expect(JSON.stringify(r.body)).not.toMatch(/token|senha|hash/i); expect(acoes()).toContain('LOGIN_OK');
  });
  test('senha errada e usuário inexistente => MESMA resposta (sem enumeração) + contagem de falhas', async () => {
    usuarios.buscarPorEmail.mockResolvedValueOnce(user); usuarios.registrarFalha.mockResolvedValue();
    const a = await request(app).post('/api/auth/login').send({ email: 'ana@x.com', senha: 'errada' });
    usuarios.buscarPorEmail.mockResolvedValueOnce(undefined);
    const b = await request(app).post('/api/auth/login').send({ email: 'nao@x.com', senha: 'errada' });
    expect([a.status, b.status]).toEqual([401, 401]); expect(a.body).toEqual(b.body); expect(usuarios.registrarFalha).toHaveBeenCalledWith(7); expect(acoes().filter(x => x === 'LOGIN_FALHA')).toHaveLength(2);
    expect(JSON.stringify(auditModel.inserir.mock.calls)).not.toMatch(/ana@x\.com|errada/); // sem e-mail/senha nos logs
  });
  test('conta bloqueada ou inativa não autentica mesmo com senha correta', async () => {
    usuarios.buscarPorEmail.mockResolvedValueOnce({ ...user, bloqueado_ate: new Date(Date.now() + 60000) });
    expect((await request(app).post('/api/auth/login').send({ email: 'ana@x.com', senha: 'Senh@Forte-2026x' })).status).toBe(401);
    usuarios.buscarPorEmail.mockResolvedValueOnce({ ...user, ativo: false });
    expect((await request(app).post('/api/auth/login').send({ email: 'ana@x.com', senha: 'Senh@Forte-2026x' })).status).toBe(401);
  });
  test('login rejeita campos extras (400)', async () => expect((await request(app).post('/api/auth/login').send({ email: 'a@b.co', senha: 'x', admin: true })).status).toBe(400));
  test('sem cookie / token adulterado => 401', async () => {
    expect((await request(app).get('/api/municipios')).status).toBe(401);
    expect((await request(app).get('/api/municipios').set('Cookie', 'token=abc.def.ghi')).status).toBe(401);
  });
  test('/me e logout', async () => {
    const s = sessao('gestor', 7); usuarios.buscarAtivoPorId.mockResolvedValueOnce({ id: 7, nome: 'Ana', email: 'a@x.com', papel: 'gestor' });
    const r = await como(request(app).get('/api/auth/me'), s); expect(r.body.csrf).toBe(s.csrf);
    usuarios.buscarAtivoPorId.mockResolvedValueOnce(undefined); expect((await como(request(app).get('/api/auth/me'), s)).status).toBe(401);
    const o = await como(request(app).post('/api/auth/logout'), s); expect(o.status).toBe(204); expect(o.headers['set-cookie'][0]).toMatch(/token=;/);
  });
  test('CSRF: método que altera estado exige X-CSRF-Token válido', async () => {
    const s = sessao('admin');
    expect((await request(app).post('/api/municipios').set('Cookie', s.cookie).send({})).status).toBe(403);
    expect((await request(app).post('/api/municipios').set('Cookie', s.cookie).set('X-CSRF-Token', 'x'.repeat(48)).send({})).status).toBe(403);
    expect(acoes().filter(a => a === 'CSRF_INVALIDO')).toHaveLength(2);
  });
});

describe('RBAC e usuários (RF08)', () => {
  test('gestor não cadastra município, critério nem usuário => 403 + auditoria', async () => {
    const s = sessao('gestor', 3);
    for (const [m, p] of [['post', '/api/municipios'], ['post', '/api/criterios'], ['get', '/api/usuarios'], ['delete', '/api/municipios/1']]) expect((await como(request(app)[m](p), s).send({})).status).toBe(403);
    expect(acoes().filter(a => a === 'ACESSO_NEGADO').length).toBe(4);
  });
  test('admin cria usuário: senha vira hash bcrypt e nunca é devolvida', async () => {
    usuarios.criar.mockImplementation(async u => ({ id: 9, nome: u.nome, email: u.email, papel: u.papel, ativo: true }));
    const r = await como(request(app).post('/api/usuarios'), sessao('admin')).send({ nome: 'Beto', email: 'beto@x.com', papel: 'gestor', senha: 'Senh@Forte-2026x' });
    expect(r.status).toBe(201); const arg = usuarios.criar.mock.calls[0][0];
    expect(arg.hash).toMatch(/^\$2[aby]\$10\$/); expect(arg.hash).not.toContain('Senh@Forte'); expect(JSON.stringify(r.body)).not.toMatch(/hash|senha/i); expect(acoes()).toContain('USUARIO_CRIADO');
  });
  test.each([['fraca', { senha: 'abc12345' }], ['papel inválido', { papel: 'root' }], ['XSS no nome', { nome: '<script>alert(1)</script>' }], ['mass assignment', { ativo: false }]])('rejeita %s', async (_, patch) => {
    const r = await como(request(app).post('/api/usuarios'), sessao('admin')).send({ nome: 'Beto', email: 'beto@x.com', papel: 'gestor', senha: 'Senh@Forte-2026x', ...patch });
    expect(r.status).toBe(400); expect(usuarios.criar).not.toHaveBeenCalled();
  });
  test('admin lista usuários; e-mail duplicado => 409 genérico', async () => {
    usuarios.listar.mockResolvedValue([{ id: 1, nome: 'A', email: 'a@x.com', papel: 'admin', ativo: true }]);
    expect((await como(request(app).get('/api/usuarios'), sessao('admin'))).body).toHaveLength(1);
    usuarios.criar.mockRejectedValue(Object.assign(new Error('duplicate key value violates unique constraint "usuarios_email_key"'), { code: '23505' }));
    const r = await como(request(app).post('/api/usuarios'), sessao('admin')).send({ nome: 'Beto', email: 'a@x.com', papel: 'gestor', senha: 'Senh@Forte-2026x' });
    expect(r.status).toBe(409); expect(JSON.stringify(r.body)).not.toMatch(/duplicate|constraint|usuarios_email/);
  });
});

describe('Gerenciamento completo de usuários (RF08)', () => {
  test('admin edita perfil/estado e audita', async () => {
    usuarios.buscarPorId.mockResolvedValue({ id: 9, nome: 'Beto', email: 'beto@x.com', papel: 'gestor', ativo: true });
    usuarios.atualizar.mockResolvedValue({ id: 9, nome: 'Beto 2', email: 'beto2@x.com', papel: 'pesquisador', ativo: false });
    const r = await como(request(app).put('/api/usuarios/9'), sessao('admin')).send({ nome: 'Beto 2', email: 'beto2@x.com', papel: 'pesquisador', ativo: false });
    expect(r.status).toBe(200); expect(r.body.papel).toBe('pesquisador'); expect(r.body.ativo).toBe(false);
    expect(acoes()).toContain('USUARIO_ATUALIZADO');
  });
  test('admin não pode desativar a própria conta', async () => {
    const r = await como(request(app).put('/api/usuarios/3'), sessao('admin', 3)).send({ ativo: false });
    expect(r.status).toBe(400); expect(usuarios.atualizar).not.toHaveBeenCalled();
  });
  test('admin redefine senha sem devolver hash', async () => {
    usuarios.buscarAtivoPorId.mockResolvedValue({ id: 9, nome: 'Beto', email: 'beto@x.com', papel: 'gestor' });
    usuarios.atualizarSenha.mockResolvedValue();
    const r = await como(request(app).patch('/api/usuarios/9/senha'), sessao('admin')).send({ senha: 'Senh@Nova-2026x' });
    expect(r.status).toBe(204); expect(usuarios.atualizarSenha.mock.calls[0][0]).toBe(9);
    expect(usuarios.atualizarSenha.mock.calls[0][1]).toMatch(/^\$2[aby]\$10\$/);
    expect(acoes()).toContain('SENHA_USUARIO_ALTERADA');
  });
});

describe('Municípios e critérios (RF01, RF02, RF03)', () => {
  const mun = { nome: "Santo Antônio d'Oeste", uf: 'BA', populacao: 1000, idh: 0.6, lat: -12.1, lng: -38.5, values: { 1: 5, 2: 0.3 } };
  test('listar / criar (UC01) / excluir com auditoria', async () => {
    municipios.listarMatriz.mockResolvedValue([{ id: 1 }]); municipios.criar.mockResolvedValue(5); municipios.excluir.mockResolvedValueOnce(true).mockResolvedValueOnce(false);
    expect((await como(request(app).get('/api/municipios'), sessao('gestor'))).body).toEqual([{ id: 1 }]);
    const c = await como(request(app).post('/api/municipios'), sessao('admin')).send(mun); expect(c.status).toBe(201); expect(c.body.id).toBe(5);
    expect((await como(request(app).delete('/api/municipios/5'), sessao('admin'))).status).toBe(204);
    expect((await como(request(app).delete('/api/municipios/6'), sessao('admin'))).status).toBe(404); expect(acoes()).toEqual(expect.arrayContaining(['MUNICIPIO_CRIADO', 'MUNICIPIO_EXCLUIDO']));
  });
  test.each([['coordenada inválida', { lat: 200 }], ['UF inválida', { uf: 'b1' }], ['XSS', { nome: '<img src=x onerror=alert(1)>' }], ['valor não numérico', { values: { 1: 'abc' } }]])('rejeita %s', async (_, p) => {
    expect((await como(request(app).post('/api/municipios'), sessao('admin')).send({ ...mun, ...p })).status).toBe(400); expect(municipios.criar).not.toHaveBeenCalled();
  });
  test('id de rota inválido => 400', async () => expect((await como(request(app).delete('/api/municipios/abc'), sessao('admin'))).status).toBe(400));
  test('critérios: listar, criar (pesquisador), alterar com auditoria antes/depois, excluir', async () => {
    criterios.listar.mockResolvedValue([{ id: 1 }]); criterios.criar.mockResolvedValue(8); criterios.obter.mockResolvedValueOnce({ nome: 'x', tipo: 'custo', peso: 0.2 }).mockResolvedValueOnce(undefined);
    criterios.atualizar.mockResolvedValue(); criterios.excluir.mockResolvedValueOnce(true).mockResolvedValueOnce(false);
    const p = sessao('pesquisador');
    expect((await como(request(app).get('/api/criterios'), p)).body).toHaveLength(1);
    expect((await como(request(app).post('/api/criterios'), p).send({ nome: 'Novo critério', tipo: 'custo', peso: 0 })).status).toBe(201);
    expect((await como(request(app).put('/api/criterios/1'), p).send({ peso: 0.3 })).status).toBe(204);
    const alt = auditModel.inserir.mock.calls.find(c => c[0].acao === 'PARAMETROS_TOPSIS_ALTERADOS')[0]; expect(alt.detalhes.antes.peso).toBe(0.2); expect(alt.detalhes.depois.peso).toBe(0.3);
    expect((await como(request(app).put('/api/criterios/2'), p).send({ peso: 0.3 })).status).toBe(404);
    expect((await como(request(app).delete('/api/criterios/1'), p)).status).toBe(204); expect((await como(request(app).delete('/api/criterios/9'), p)).status).toBe(404);
    expect((await como(request(app).post('/api/criterios'), p).send({ nome: 'x', tipo: 'qualquer' })).status).toBe(400);
  });
});

describe('TOPSIS, simulações e relatórios (RF04, RF06, RF10)', () => {
  const matriz = [[15, 0.8, 980, 0.75, 5.2], [5, 2.1, 1850, 0.62, 5.8], [22, 0.3, 650, 0.89, 4.9]].map((v, i) => ({ id: i + 1, nome: 'Município ' + 'ABC'[i], uf: 'BA', lat: 0, lng: 0, values: Object.fromEntries(v.map((x, k) => [k + 1, x])) }));
  const crit = [[1, 'custo', 0.2], [2, 'beneficio', 0.2], [3, 'beneficio', 0.15], [4, 'custo', 0.25], [5, 'beneficio', 0.2]].map(([id, tipo, peso]) => ({ id, tipo, peso }));
  beforeEach(() => { criterios.parametrosPorIds.mockResolvedValue(crit.map(c => ({ id: c.id, nome: 'C' + c.id, tipo: c.tipo, peso: c.peso }))); municipios.listarMatriz.mockResolvedValue(matriz); simulacoes.salvarSimulacao.mockResolvedValue(42); });
  test('exemplo do Cap. 7.3 via API: B > A > C, persiste e audita', async () => {
    const r = await como(request(app).post('/api/topsis/executar'), sessao('gestor', 3)).send({ criterios: crit });
    expect(r.status).toBe(200); expect(r.body.ranking.map(x => x.nome)).toEqual(['Município B', 'Município A', 'Município C']); expect(r.body.simulacaoId).toBe(42);
    r.body.ranking.forEach(x => { expect(x.ci).toBeGreaterThanOrEqual(0); expect(x.ci).toBeLessThanOrEqual(1); });
    const salvo = simulacoes.salvarSimulacao.mock.calls[0][0]; expect(salvo.usuarioId).toBe(3); expect(salvo.parametros.top).toBe('Município B'); expect(acoes()).toContain('TOPSIS_EXECUTADO');
  });
  test('soma dos pesos ≠ 1,0 => 422 (validação no servidor)', async () => {
    const r = await como(request(app).post('/api/topsis/executar'), sessao('admin')).send({ criterios: crit.map(c => ({ ...c, peso: 0.3 })) });
    expect(r.status).toBe(422); expect(simulacoes.salvarSimulacao).not.toHaveBeenCalled();
  });
  test('critério repetido, inexistente, matriz incompleta e filtro de municípios', async () => {
    const s = sessao('admin');
    expect((await como(request(app).post('/api/topsis/executar'), s).send({ criterios: [crit[0], { ...crit[0], peso: 0.5 }, { ...crit[1], peso: 0.3 }] })).status).toBe(400);
    criterios.parametrosPorIds.mockResolvedValueOnce([{ id: 1, nome: 'C1', tipo: 'custo', peso: 0.2 }]); expect((await como(request(app).post('/api/topsis/executar'), s).send({ criterios: crit })).status).toBe(400);
    expect((await como(request(app).post('/api/topsis/executar'), s).send({ criterios: crit, municipioIds: [1] })).status).toBe(422);
    municipios.listarMatriz.mockResolvedValueOnce([{ ...matriz[0], values: {} }, matriz[1]]); expect((await como(request(app).post('/api/topsis/executar'), s).send({ criterios: crit })).status).toBe(422);
  });
  test('simulações: lista respeita papel; obter de terceiro => 404 (anti-IDOR); id inválido => 400', async () => {
    simulacoes.listar.mockResolvedValue([]); await como(request(app).get('/api/simulacoes'), sessao('gestor', 3));
    expect(simulacoes.listar).toHaveBeenCalledWith({ admin: false, usuarioId: 3 });
    simulacoes.obter.mockResolvedValueOnce(null); expect((await como(request(app).get('/api/simulacoes/1'), sessao('gestor', 3))).status).toBe(404);
    simulacoes.obter.mockResolvedValueOnce({ id: 1 }); expect((await como(request(app).get('/api/simulacoes/1'), sessao('gestor', 3))).body.id).toBe(1);
    expect((await como(request(app).get('/api/simulacoes/1;DROP'), sessao('admin'))).status).toBe(400);
  });
  test('relatórios: PDF válido, CSV neutraliza formula injection, 404 e auditoria', async () => {
    const sim = { id: 5, data: new Date(), ranking: [{ pos: 1, nome: '=HYPERLINK("http://evil")', uf: 'BA', dPlus: 0.1, dMinus: 0.2, ci: 0.66 }] };
    simulacoes.obter.mockResolvedValue(sim); const s = sessao('gestor');
    const pdf = await como(request(app).get('/api/relatorios/5/pdf').buffer(true).parse((res, cb) => { const d = []; res.on('data', c => d.push(c)); res.on('end', () => cb(null, Buffer.concat(d))); }), s);
    expect(pdf.headers['content-type']).toBe('application/pdf'); expect(pdf.body.slice(0, 4).toString()).toBe('%PDF'); expect(pdf.headers['content-disposition']).toContain('relatorio-5.pdf');
    const csv = await como(request(app).get('/api/relatorios/5/csv'), s); expect(csv.text).toContain(`"'=HYPERLINK`); expect(csv.text).not.toMatch(/;=HYPERLINK|\n1;=HYPERLINK/);
    simulacoes.obter.mockResolvedValue(null); expect((await como(request(app).get('/api/relatorios/9/pdf'), s)).status).toBe(404); expect(acoes().filter(a => a === 'RELATORIO_EXPORTADO')).toHaveLength(2);
  });
});

describe('Experiência por perfil: Gestor usa a configuração oficial (UC02 é do Pesquisador)', () => {
  const m = [1, 2].map(i => ({ id: i, nome: 'M' + i, uf: 'BA', lat: 0, lng: 0, values: { 1: i * 10, 2: 5 - i } }));
  const oficial = [{ id: 1, nome: 'C1', tipo: 'custo', peso: 0.7 }, { id: 2, nome: 'C2', tipo: 'beneficio', peso: 0.3 }];
  beforeEach(() => { municipios.listarMatriz.mockResolvedValue(m); simulacoes.salvarSimulacao.mockResolvedValue(77); criterios.parametrosPorIds.mockResolvedValue(oficial); });
  test('gestor envia pesos/tipos próprios => servidor ignora e usa os oficiais', async () => {
    const r = await como(request(app).post('/api/topsis/executar'), sessao('gestor', 3)).send({ criterios: [{ id: 1, tipo: 'beneficio', peso: 0.1 }, { id: 2, tipo: 'custo', peso: 0.9 }] });
    expect(r.status).toBe(200); expect(r.body.metadata.configuracaoOficial).toBe(true);
    const usados = simulacoes.salvarSimulacao.mock.calls[0][0].parametros.criterios; expect(usados).toEqual([{ id: 1, tipo: 'custo', peso: 0.7 }, { id: 2, tipo: 'beneficio', peso: 0.3 }]);
    expect(auditModel.inserir.mock.calls.find(c => c[0].acao === 'TOPSIS_EXECUTADO')[0].detalhes.origem).toBe('configuracao_oficial');
  });
  test('pesquisador usa os pesos que informa (UC02)', async () => {
    const r = await como(request(app).post('/api/topsis/executar'), sessao('pesquisador', 4)).send({ criterios: [{ id: 1, tipo: 'beneficio', peso: 0.1 }, { id: 2, tipo: 'custo', peso: 0.9 }] });
    expect(r.status).toBe(200); expect(r.body.metadata.configuracaoOficial).toBe(false);
    expect(simulacoes.salvarSimulacao.mock.calls[0][0].parametros.criterios[0]).toEqual({ id: 1, tipo: 'beneficio', peso: 0.1 });
  });
  test('configuração oficial que não soma 1,0 => 422 orientando o gestor', async () => {
    criterios.parametrosPorIds.mockResolvedValue([{ ...oficial[0], peso: 0.5 }, oficial[1]]);
    const r = await como(request(app).post('/api/topsis/executar'), sessao('gestor', 3)).send({ criterios: [{ id: 1, tipo: 'custo', peso: 0.5 }, { id: 2, tipo: 'beneficio', peso: 0.5 }] });
    expect(r.status).toBe(422); expect(r.body.erro).toMatch(/oficial/i); expect(simulacoes.salvarSimulacao).not.toHaveBeenCalled();
  });
  test('auditoria: somente admin; limite validado', async () => {
    auditModel.listar.mockResolvedValue([{ id: 1, acao: 'LOGIN_OK' }]);
    expect((await como(request(app).get('/api/auditoria?limite=5'), sessao('admin'))).body).toHaveLength(1); expect(auditModel.listar).toHaveBeenCalledWith(5);
    expect((await como(request(app).get('/api/auditoria'), sessao('pesquisador'))).status).toBe(403); expect((await como(request(app).get('/api/auditoria'), sessao('gestor'))).status).toBe(403);
    expect((await como(request(app).get('/api/auditoria?limite=9999'), sessao('admin'))).status).toBe(400); expect((await como(request(app).get('/api/auditoria?x=1'), sessao('admin'))).status).toBe(400);
  });
});

describe('Importação IBGE/CEP (RF09)', () => {
  const j = body => ({ ok: true, status: 200, json: async () => body });
  afterEach(() => { delete global.fetch; });
  test('IBGE: sanitiza dado externo e só chama host fixo', async () => {
    global.fetch = jest.fn(async url => url.includes('/api/v1/localidades/') ? j({ nome: 'Juazeiro<script>', microrregiao: { mesorregiao: { UF: { sigla: 'ba' } } } }) : j([{ resultados: [{ series: [{ serie: { 2021: '237000' } }] }] }]));
    const r = await como(request(app).get('/api/importacao/ibge/2918407'), sessao('admin'));
    expect(r.body).toEqual({ codigo: '2918407', nome: 'Juazeiroscript', uf: 'BA', populacao: 237000 });
    global.fetch.mock.calls.forEach(([u]) => expect(u).toMatch(/^https:\/\/servicodados\.ibge\.gov\.br\//));
  });
  test('IBGE: código inválido => 400; sem permissão => 403; fonte fora do ar => 502; não encontrado => 404', async () => {
    expect((await como(request(app).get('/api/importacao/ibge/12'), sessao('admin'))).status).toBe(400);
    expect((await como(request(app).get('/api/importacao/ibge/2918407'), sessao('gestor'))).status).toBe(403);
    global.fetch = jest.fn(async () => ({ ok: false, status: 500 })); expect((await como(request(app).get('/api/importacao/ibge/2918407'), sessao('admin'))).status).toBe(502);
    global.fetch = jest.fn(async () => ({ ok: false, status: 404 })); expect((await como(request(app).get('/api/importacao/ibge/2918407'), sessao('admin'))).status).toBe(404);
  });
  test('CEP: resolve via ViaCEP + IBGE; CEP inexistente => 404', async () => {
    global.fetch = jest.fn(async url => url.includes('viacep') ? j({ ibge: '2918407' }) : url.includes('/api/v1/localidades/') ? j({ nome: 'Juazeiro', 'regiao-imediata': { 'regiao-intermediaria': { UF: { sigla: 'BA' } } } }) : j([]));
    const r = await como(request(app).get('/api/importacao/cep/48900000'), sessao('admin')); expect(r.body).toMatchObject({ nome: 'Juazeiro', uf: 'BA', populacao: null });
    global.fetch = jest.fn(async () => j({ erro: true })); expect((await como(request(app).get('/api/importacao/cep/00000000'), sessao('admin'))).status).toBe(404);
  });
});

describe('Importação ANEEL (RF09)', () => {
  afterEach(() => { delete global.fetch; });
  test('agrega potência solar e projetos por município usando a API pública CKAN', async () => {
    global.fetch = jest.fn(async (url) => {
      if (String(url).includes('/api/3/action/package_show')) return { ok: true, status: 200, json: async () => ({
        result: { resources: [{ id: 'recurso-aneel', name: 'empreendimento-geracao-distribuida.csv', datastore_active: true }] }
      }) };
      return { ok: true, status: 200, json: async () => ({
        result: { records: [{ projetos_solares: '12', projetos_renovaveis: '15', potencia_solar_kw: '240.5' }] }
      }) };
    });
    const r = await como(request(app).get('/api/importacao/aneel/2927408'), sessao('admin'));
    expect(r.status).toBe(200);
    expect(r.body).toMatchObject({ codigo: '2927408', fonte: 'ANEEL', projetosSolares: 12, projetosRenovaveisAtivos: 15, potenciaSolarKw: 240.5 });
    expect(global.fetch.mock.calls[1][0]).toContain('/api/action/datastore_search_sql');
    expect(acoes()).toContain('IMPORTACAO_ANEEL');
  });
  test('código inválido e ausência de recurso ANEEL são tratados', async () => {
    expect((await como(request(app).get('/api/importacao/aneel/12'), sessao('admin'))).status).toBe(400);
    global.fetch = jest.fn(async () => ({ ok: true, status: 200, json: async () => ({ result: { resources: [] } }) }));
    expect((await como(request(app).get('/api/importacao/aneel/2927408'), sessao('admin'))).status).toBe(502);
  });
});

describe('Tratamento de erros', () => {
  test('erro interno => 500 genérico com requestId, sem stack/SQL; detalhes só no log', async () => {
    municipios.listarMatriz.mockRejectedValue(Object.assign(new Error('relation "municipios" does not exist at /srv/app/db.js:10'), { code: '42P01' }));
    const r = await como(request(app).get('/api/municipios'), sessao('admin'));
    expect(r.status).toBe(500); expect(r.body.erro).toBe('Erro interno do servidor'); expect(r.body.requestId).toBeTruthy();
    expect(JSON.stringify(r.body)).not.toMatch(/relation|srv\/app|42P01|stack/);
  });
  test('bootstrap do admin: idempotente, valida política de senha e não usa padrão', async () => {
    const { ensureAdmin } = require('../src/bootstrap');
    expect(await ensureAdmin({})).toBe(false);
    await expect(ensureAdmin({ ADMIN_EMAIL: 'a@b.co', ADMIN_PASSWORD: 'fraca' })).rejects.toThrow();
    usuarios.garantirAdmin.mockResolvedValue(); expect(await ensureAdmin({ ADMIN_EMAIL: 'A@B.co', ADMIN_PASSWORD: 'Admin@Segura-2026' })).toBe(true);
    expect(usuarios.garantirAdmin.mock.calls[0][0]).toBe('a@b.co'); expect(usuarios.garantirAdmin.mock.calls[0][1]).toMatch(/^\$2/);
  });
});
