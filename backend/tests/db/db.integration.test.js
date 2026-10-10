// Integração REAL (API + PostgreSQL/PostGIS). Execução: RUN_DB_TESTS=1 DATABASE_URL=... npm run test:db
const run = process.env.RUN_DB_TESTS ? describe : describe.skip;
const fs = require('fs'), path = require('path'), request = require('supertest');
run('API + PostgreSQL/PostGIS (Cap. 10 – integração)', () => {
  let app, db, auth, agents = {}, sims;
  const csrf = {};
  const login = async (email, senha = 'Senh@Forte-2026x') => { const a = request.agent(app); const r = await a.post('/api/auth/login').send({ email, senha }); return { a, r }; };
  const post = (k, url, body) => agents[k].post(url).set('X-CSRF-Token', csrf[k]).send(body);
  const put = (k, url, body) => agents[k].put(url).set('X-CSRF-Token', csrf[k]).send(body);
  const del = (k, url) => agents[k].delete(url).set('X-CSRF-Token', csrf[k]);

  beforeAll(async () => {
    db = require('../../src/config/db');
    await db.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
    await db.query(fs.readFileSync(path.join(__dirname, '../../migrations/001_init.sql'), 'utf8'));
    app = require('../../src/app'); auth = require('../../src/services/auth.service');
    const usuarios = require('../../src/models/usuario.model'); const hash = await auth.hash('Senh@Forte-2026x');
    for (const [email, papel] of [['admin@t.com', 'admin'], ['pesq@t.com', 'pesquisador'], ['gest@t.com', 'gestor'], ['gest2@t.com', 'gestor']]) await usuarios.criar({ nome: papel, email, papel, hash });
    for (const [k, e] of [['admin', 'admin@t.com'], ['pesq', 'pesq@t.com'], ['gest', 'gest@t.com'], ['gest2', 'gest2@t.com']]) { const { a, r } = await login(e); agents[k] = a; csrf[k] = r.body.csrf; }
  });
  afterAll(async () => { await db.end(); });

  test('schema aplicado: 7 critérios do Cap. 7.1 com pesos somando 1,0', async () => {
    const r = await agents.admin.get('/api/criterios'); expect(r.body).toHaveLength(7);
    expect(r.body.reduce((s, c) => s + c.weight, 0)).toBeCloseTo(1, 6); expect(r.body.map(c => c.type)).toEqual(['cost', 'benefit', 'benefit', 'cost', 'benefit', 'cost', 'benefit']);
  });
  test('UC01: admin cadastra municípios (PostGIS roundtrip lat/lng) e matriz do Cap. 7.3', async () => {
    const dados = { A: [15, 0.8, 980, 0.75, 5.2], B: [5, 2.1, 1850, 0.62, 5.8], C: [22, 0.3, 650, 0.89, 4.9] };
    let i = 0; for (const [n, v] of Object.entries(dados)) { const r = await post('admin', '/api/municipios', { nome: 'Município ' + n, uf: 'BA', populacao: 1000, idh: 0.7, lat: -12.5 - i, lng: -38.25, values: Object.fromEntries(v.map((x, k) => [k + 1, x])) }); expect(r.status).toBe(201); i++; }
    const l = await agents.gest.get('/api/municipios'); expect(l.body).toHaveLength(3);
    const a = l.body.find(m => m.nome === 'Município A'); expect(a.lat).toBeCloseTo(-12.5, 6); expect(a.lng).toBeCloseTo(-38.25, 6); expect(a.values['1']).toBe(15);
  });
  test('RBAC real: gestor não cadastra; pesquisador não cadastra município', async () => {
    expect((await post('gest', '/api/municipios', {})).status).toBe(403); expect((await post('pesq', '/api/municipios', {})).status).toBe(403);
  });
  const crit = [[1, 'custo', 0.2], [2, 'beneficio', 0.2], [3, 'beneficio', 0.15], [4, 'custo', 0.25], [5, 'beneficio', 0.2]].map(([id, tipo, peso]) => ({ id, tipo, peso }));
  test('UC03: pesquisador executa TOPSIS => B > A > C e simulação persistida', async () => {
    const r = await post('pesq', '/api/topsis/executar', { criterios: crit }); expect(r.status).toBe(200);
    expect(r.body.ranking.map(x => x.nome)).toEqual(['Município B', 'Município A', 'Município C']); sims = r.body.simulacaoId;
    const { rows } = await db.query('SELECT count(*)::int n FROM resultados_ranking WHERE simulacao_id=$1', [sims]); expect(rows[0].n).toBe(3);
    const g = await agents.pesq.get(`/api/simulacoes/${sims}`); expect(g.body.ranking[0].nome).toBe('Município B'); expect(g.body.ranking[0].scores).toHaveLength(5); expect(g.body.parametros.top).toBe('Município B');
  });
  test('pesos inválidos => 422 e nada é persistido', async () => {
    const antes = (await db.query('SELECT count(*)::int n FROM simulacoes')).rows[0].n;
    expect((await post('pesq', '/api/topsis/executar', { criterios: crit.map(c => ({ ...c, peso: 0.3 })) })).status).toBe(422);
    expect((await db.query('SELECT count(*)::int n FROM simulacoes')).rows[0].n).toBe(antes);
  });
  test('anti-IDOR: outro usuário não vê nem exporta a simulação; admin vê', async () => {
    expect((await agents.gest2.get(`/api/simulacoes/${sims}`)).status).toBe(404); expect((await agents.gest2.get(`/api/relatorios/${sims}/pdf`)).status).toBe(404);
    expect((await agents.gest2.get('/api/simulacoes')).body).toHaveLength(0); expect((await agents.admin.get(`/api/simulacoes/${sims}`)).status).toBe(200); expect((await agents.admin.get('/api/simulacoes')).body.length).toBeGreaterThan(0);
  });
  test('UC04: exporta PDF e CSV da própria simulação', async () => {
    const csv = await agents.pesq.get(`/api/relatorios/${sims}/csv`); expect(csv.status).toBe(200); expect(csv.text).toContain('Município B');
    const pdf = await agents.pesq.get(`/api/relatorios/${sims}/pdf`).buffer(true).parse((res, cb) => { const d = []; res.on('data', c => d.push(c)); res.on('end', () => cb(null, Buffer.concat(d))); }); expect(pdf.body.slice(0, 4).toString()).toBe('%PDF');
  });
  test('auditoria: ações críticas gravadas, sem dados sensíveis', async () => {
    expect((await put('pesq', '/api/criterios/1', { peso: 0.25 })).status).toBe(204);
    const { rows } = await db.query('SELECT acao, detalhes, ip FROM audit_logs ORDER BY id'); const acoes = rows.map(r => r.acao);
    expect(acoes).toEqual(expect.arrayContaining(['LOGIN_OK', 'MUNICIPIO_CRIADO', 'TOPSIS_EXECUTADO', 'ACESSO_NEGADO', 'PARAMETROS_TOPSIS_ALTERADOS']));
    const alt = rows.find(r => r.acao === 'PARAMETROS_TOPSIS_ALTERADOS').detalhes; expect(alt.antes.peso).toBeCloseTo(0.2); expect(alt.depois.peso).toBe(0.25);
    expect(JSON.stringify(rows)).not.toMatch(/Senh@Forte|senha_hash|\$2[aby]\$|csrf/i);
  });
  test('SQL injection: texto malicioso é gravado literalmente (consulta parametrizada) e tabelas continuam intactas', async () => {
    const nome = "x'); DROP TABLE criterios;--"; const r = await post('pesq', '/api/criterios', { nome, tipo: 'custo', peso: 0 }); expect(r.status).toBe(201);
    expect((await db.query('SELECT nome FROM criterios WHERE id=$1', [r.body.id])).rows[0].nome).toBe(nome); expect((await agents.admin.get('/api/criterios')).body.length).toBe(8);
    expect((await agents.admin.get("/api/simulacoes/1 OR 1=1")).status).toBe(400);
  });
  test('exclusão de município em cascata (matriz e rankings)', async () => {
    const id = (await agents.admin.get('/api/municipios')).body.find(m => m.nome === 'Município C').id;
    expect((await del('admin', `/api/municipios/${id}`)).status).toBe(204);
    expect((await db.query('SELECT count(*)::int n FROM matriz_decisao WHERE municipio_id=$1', [id])).rows[0].n).toBe(0);
    expect((await db.query('SELECT count(*)::int n FROM resultados_ranking WHERE municipio_id=$1', [id])).rows[0].n).toBe(0);
    expect((await del('admin', `/api/municipios/${id}`)).status).toBe(404);
  });
  test('Gestor executa SEMPRE com a configuração oficial salva pelo Pesquisador (UC02 → UC03)', async () => {
    for (const [id, tipo, peso] of [[1, 'custo', 0.2], [2, 'beneficio', 0.2], [3, 'beneficio', 0.15], [4, 'custo', 0.25], [5, 'beneficio', 0.2]]) expect((await put('pesq', `/api/criterios/${id}`, { tipo, peso })).status).toBe(204);
    const burlando = [1, 2, 3, 4, 5].map(id => ({ id, tipo: id % 2 ? 'beneficio' : 'custo', peso: 0.2 })); // tenta inverter tipos e igualar pesos
    const r = await post('gest', '/api/topsis/executar', { criterios: burlando }); expect(r.status).toBe(200); expect(r.body.metadata.configuracaoOficial).toBe(true);
    const p = (await agents.admin.get(`/api/simulacoes/${r.body.simulacaoId}`)).body.parametros.criterios; expect(p.map(c => c.peso)).toEqual([0.2, 0.2, 0.15, 0.25, 0.2]); expect(p.map(c => c.tipo)).toEqual(['custo', 'beneficio', 'beneficio', 'custo', 'beneficio']);
    const sub = await post('gest', '/api/topsis/executar', { criterios: burlando.slice(0, 3) }); expect(sub.status).toBe(422); // subconjunto não soma 1,0 com os pesos oficiais
  });
  test('trilha de auditoria: só admin lê; sem dados sensíveis', async () => {
    const r = await agents.admin.get('/api/auditoria?limite=100'); expect(r.status).toBe(200); expect(r.body.length).toBeGreaterThan(5); expect(r.body.map(e => e.acao)).toContain('TOPSIS_EXECUTADO');
    expect(JSON.stringify(r.body)).not.toMatch(/Senh@Forte|\$2[aby]\$|csrf/i); expect((await agents.gest.get('/api/auditoria')).status).toBe(403); expect((await agents.pesq.get('/api/auditoria')).status).toBe(403);
  });
  test('e-mail duplicado => 409 genérico; senha fraca => 400', async () => {
    const u = { nome: 'Dup', email: 'admin@t.com', papel: 'gestor', senha: 'Senh@Forte-2026x' };
    const r = await post('admin', '/api/usuarios', u); expect(r.status).toBe(409); expect(JSON.stringify(r.body)).not.toMatch(/duplicate|constraint/);
    expect((await post('admin', '/api/usuarios', { ...u, email: 'n@t.com', senha: 'fraca' })).status).toBe(400);
    const ok = await post('admin', '/api/usuarios', { ...u, email: 'novo@t.com' }); expect(ok.status).toBe(201);
    expect((await db.query("SELECT senha_hash FROM usuarios WHERE email='novo@t.com'")).rows[0].senha_hash).toMatch(/^\$2[aby]\$10\$/);
  });
  test('bloqueio de conta após 5 falhas (mesmo com a senha correta)', async () => {
    for (let i = 0; i < 5; i++) expect((await login('gest2@t.com', 'errada')).r.status).toBe(401);
    expect((await login('gest2@t.com')).r.status).toBe(401);
    expect((await db.query("SELECT tentativas_falhas, bloqueado_ate FROM usuarios WHERE email='gest2@t.com'")).rows[0].bloqueado_ate).not.toBeNull();
  });
  test('RNF01: TOPSIS com 500 alternativas e 7 critérios em < 3 s (ponta a ponta)', async () => {
    await db.query("DELETE FROM municipios");
    await db.query("INSERT INTO municipios(nome,uf,populacao,coordenadas) SELECT 'M'||g,'BA',1000,ST_SetSRID(ST_MakePoint(-40,-12),4326) FROM generate_series(1,500) g");
    await db.query('INSERT INTO matriz_decisao(municipio_id,criterio_id,valor,ano_referencia) SELECT m.id,c.id,(random()*100)::numeric(15,4),2024 FROM municipios m CROSS JOIN (SELECT id FROM criterios WHERE id<=7) c');
    const t = Date.now(); const r = await post('pesq', '/api/topsis/executar', { criterios: [[1, 'custo'], [2, 'beneficio'], [3, 'beneficio'], [4, 'custo'], [5, 'beneficio'], [6, 'custo'], [7, 'beneficio']].map(([id, tipo]) => ({ id, tipo, peso: id < 7 ? 0.14 : 0.16 })) });
    const ms = Date.now() - t; expect(r.status).toBe(200); expect(r.body.ranking).toHaveLength(500); expect(ms).toBeLessThan(3000); console.log(`RNF01: 500 alternativas em ${ms} ms`);
  });
});
