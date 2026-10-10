'use strict';
const simulacoes = require('../models/simulacao.model');
const relatorio = require('../services/relatorio.service');
const { audit } = require('../middlewares/audit');
const enviar = formato => async (req, res) => { // UC04 / RF06
  const s = await simulacoes.obter(req.params.id, req.user);
  if (!s) return res.status(404).json({ erro: 'Recurso não encontrado' });
  await audit(req, 'RELATORIO_EXPORTADO', { entidade: 'simulacoes', entidadeId: s.id, detalhes: { formato } });
  res.setHeader('Content-Disposition', `attachment; filename="relatorio-${s.id}.${formato}"`); // nome sem input do usuário
  if (formato === 'pdf') { res.setHeader('Content-Type', 'application/pdf'); return relatorio.pdf(res, s); }
  res.setHeader('Content-Type', 'text/csv; charset=utf-8'); res.send(relatorio.csv(s.ranking));
};
exports.pdf = enviar('pdf'); exports.csv = enviar('csv');
