'use strict';
// RF09: importação de fontes externas (IBGE). Hosts FIXOS e entradas numéricas validadas => sem SSRF.
const IBGE = 'https://servicodados.ibge.gov.br', VIACEP = 'https://viacep.com.br';
const getJson = async url => {
  const r = await fetch(url, { signal: AbortSignal.timeout(5000), headers: { Accept: 'application/json' }, redirect: 'error' });
  if (r.status === 404) throw Object.assign(new Error('não encontrado'), { status: 404 });
  if (!r.ok) throw Object.assign(new Error('fonte externa indisponível'), { status: 502 });
  return r.json();
};
const txt = s => String(s ?? '').replace(/[\u0000-\u001f\u007f<>"`\\]/g, '').slice(0, 120); // dado externo é não confiável
exports.municipioIBGE = async codigo => {
  const m = await getJson(`${IBGE}/api/v1/localidades/municipios/${codigo}`);
  if (!m || !m.nome) throw Object.assign(new Error('não encontrado'), { status: 404 });
  const uf = m.microrregiao?.mesorregiao?.UF?.sigla ?? m['regiao-imediata']?.['regiao-intermediaria']?.UF?.sigla ?? '';
  let populacao = null;
  try { // população estimada (SIDRA 6579, variável 9324) – melhor esforço
    const a = await getJson(`${IBGE}/api/v3/agregados/6579/periodos/-1/variaveis/9324?localidades=N6[${codigo}]`);
    const v = Object.values(a?.[0]?.resultados?.[0]?.series?.[0]?.serie ?? {})[0]; const n = Number(v); populacao = Number.isFinite(n) ? n : null;
  } catch { /* opcional */ }
  return { codigo: String(codigo), nome: txt(m.nome), uf: txt(uf).slice(0, 2).toUpperCase(), populacao };
};
exports.municipioPorCep = async cep => {
  const c = await getJson(`${VIACEP}/ws/${cep}/json/`);
  if (!c || c.erro || !/^\d{7}$/.test(String(c.ibge || ''))) throw Object.assign(new Error('não encontrado'), { status: 404 });
  return exports.municipioIBGE(c.ibge);
};

const ANEEL = 'https://dadosabertos.aneel.gov.br';
const getJsonPost = async (url, body) => {
  const r = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(10000),
    redirect: 'error'
  });
  if (r.status === 404) throw Object.assign(new Error('não encontrado'), { status: 404 });
  if (!r.ok) throw Object.assign(new Error('fonte externa indisponível'), { status: 502 });
  return r.json();
};

exports.municipioANEEL = async codigo => {
  // CKAN publica o conjunto MMGD e oferece datastore_search para consulta.
  const pkg = await getJson(`${ANEEL}/api/3/action/package_show?id=relacao-de-empreendimentos-de-geracao-distribuida`);
  const resources = pkg?.result?.resources || [];
  const resource = resources.find(r =>
    /empreendimento-geracao-distribuida/i.test(r.name || '') && r.datastore_active && r.id
  );
  if (!resource) throw Object.assign(new Error('recurso ANEEL indisponível'), { status: 502 });

  const sql = `
    SELECT
      COUNT(*) FILTER (WHERE upper(COALESCE("SigTipoGeracao", '')) = 'UFV') AS projetos_solares,
      COALESCE(SUM(CASE WHEN upper(COALESCE("SigTipoGeracao", '')) = 'UFV'
                        THEN CAST(NULLIF(REPLACE(CAST("MdaPotenciaInstaladaKW" AS TEXT), ',', '.'), '') AS DOUBLE PRECISION)
                        ELSE 0 END), 0) AS potencia_solar_kw,
      COUNT(*) AS projetos_renovaveis
    FROM "${resource.id}"
    WHERE CAST("CodMunicipioIbge" AS TEXT) = $1
  `;
  const result = await getJsonPost(`${ANEEL}/api/action/datastore_search_sql`, { sql });
  const row = result?.result?.records?.[0];
  if (!row) throw Object.assign(new Error('município não encontrado na ANEEL'), { status: 404 });

  const projetos = Number(row.projetos_renovaveis);
  const solares = Number(row.projetos_solares);
  const potencia = Number(row.potencia_solar_kw);
  return {
    codigo: String(codigo),
    fonte: 'ANEEL',
    projetosRenovaveisAtivos: Number.isFinite(projetos) ? projetos : 0,
    projetosSolares: Number.isFinite(solares) ? solares : 0,
    potenciaSolarKw: Number.isFinite(potencia) ? potencia : 0,
    unidadePotencia: 'kW'
  };
};
