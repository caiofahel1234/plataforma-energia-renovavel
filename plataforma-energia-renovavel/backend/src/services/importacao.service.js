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
    signal: AbortSignal.timeout(15000),
    redirect: 'error'
  });
  if (r.status === 404) throw Object.assign(new Error('não encontrado'), { status: 404 });
  if (!r.ok) throw Object.assign(new Error('fonte externa indisponível'), { status: 502 });
  return r.json();
};

// RF09 / ANEEL: consulta o catálogo CKAN oficial e depois o DataStore.
// O uso de datastore_search evita depender de nomes/ordem fixa de colunas SQL.
exports.municipioANEEL = async codigo => {
  const pkg = await getJson(`${ANEEL}/api/3/action/package_show?id=relacao-de-empreendimentos-de-geracao-distribuida`);
  const resources = pkg?.result?.resources || [];
  const resource = resources.find(r => r?.datastore_active && r?.id && /empreendimento.*gera[cç][aã]o.*distribu[ií]da/i.test(String(r.name || '')))
    || resources.find(r => r?.datastore_active && r?.id);
  if (!resource) throw Object.assign(new Error('recurso ANEEL indisponível'), { status: 502 });

  const result = await getJsonPost(`${ANEEL}/api/action/datastore_search`, {
    resource_id: resource.id,
    filters: { CodMunicipioIbge: String(codigo) },
    limit: 32000
  });
  const records = Array.isArray(result?.result?.records) ? result.result.records : [];
  if (!records.length) throw Object.assign(new Error('município não encontrado na ANEEL'), { status: 404 });

  const num = v => {
    if (v === null || v === undefined || v === '') return 0;
    const n = Number(String(v).replace(',', '.'));
    return Number.isFinite(n) ? n : 0;
  };
  const tipo = r => String(r.SigTipoGeracao ?? r.sig_tipo_geracao ?? '').trim().toUpperCase();
  const potencia = r => num(r.MdaPotenciaInstaladaKW ?? r.MdaPotencialInstaladakW ?? r.MdaPotencialInstaladoKW ?? r.mda_potencia_instalada_kw);
  const renovaveis = new Set(['UFV', 'EOL', 'PCH', 'CGH', 'CGU']);
  const solares = records.filter(r => tipo(r) === 'UFV');
  const renovaveisAtivos = records.filter(r => renovaveis.has(tipo(r)));
  const potenciaSolarKw = solares.reduce((s, r) => s + potencia(r), 0);

  let populacao = null;
  try { populacao = (await exports.municipioIBGE(codigo)).populacao; } catch { /* dado auxiliar */ }
  return {
    codigo: String(codigo),
    fonte: 'ANEEL',
    recursoId: resource.id,
    projetosRenovaveisAtivos: renovaveisAtivos.length,
    projetosSolares: solares.length,
    potenciaSolarKw,
    capacidadeSolarKwPorHabitante: populacao > 0 ? potenciaSolarKw / populacao : null,
    unidadePotencia: 'kW',
    observacao: 'A contagem usa os empreendimentos retornados pelo conjunto oficial de geração distribuída da ANEEL; a disponibilidade e atualização dependem da fonte externa.'
  };
};
