'use strict';
const criterios = require('../models/criterio.model');
const municipios = require('../models/municipio.model');
const simulacoes = require('../models/simulacao.model');
const topsisService = require('../services/topsis.service');
const { audit } = require('../middlewares/audit');

exports.executar = async (req, res) => { // UC03 / RF04
  const t0 = Date.now();
  const { criterios: enviados, municipioIds } = req.body;
  if (new Set(enviados.map(c => c.id)).size !== enviados.length) return res.status(400).json({ erro: 'Dados inválidos' });
  const params = await criterios.parametrosPorIds(enviados.map(c => c.id));
  if (params.length !== enviados.length) return res.status(400).json({ erro: 'Dados inválidos' });
  const bd = Object.fromEntries(params.map(p => [p.id, p]));
  // Gestor Público executa SEMPRE com a configuração oficial (UC02 é do Pesquisador): tipo/peso enviados pelo cliente são ignorados.
  const oficial = req.user.papel === 'gestor';
  const crit = enviados.map(c => oficial ? { id: c.id, tipo: bd[c.id].tipo, peso: bd[c.id].peso, nome: bd[c.id].nome } : { ...c, nome: bd[c.id].nome });
  if (Math.abs(crit.reduce((s, c) => s + c.peso, 0) - 1) > 1e-6)
    return res.status(422).json({ erro: oficial ? 'A configuração oficial de pesos não soma 1,0. Solicite ao Pesquisador.' : 'A soma dos pesos deve ser 1,0' });
  let munis = await municipios.listarMatriz();
  if (municipioIds) munis = munis.filter(m => municipioIds.includes(m.id));
  if (munis.length < 2 || munis.some(m => crit.some(c => typeof m.values[c.id] !== 'number'))) return res.status(422).json({ erro: 'Matriz de decisão incompleta' });
  const { simulacaoId, ranking } = await topsisService.executarESalvar({ repo: simulacoes, usuarioId: req.user.id, criterios: crit, munis });
  await audit(req, 'TOPSIS_EXECUTADO', { entidade: 'simulacoes', entidadeId: simulacaoId, detalhes: { criterios: crit.map(({ id, tipo, peso }) => ({ id, tipo, peso })), n: munis.length, origem: oficial ? 'configuracao_oficial' : 'informado' } });
  res.json({ simulacaoId, ranking, metadata: { n: munis.length, tempoMs: Date.now() - t0, configuracaoOficial: oficial } });
};
