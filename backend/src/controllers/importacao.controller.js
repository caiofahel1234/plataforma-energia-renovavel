'use strict';
const importacao = require('../services/importacao.service');
const { audit } = require('../middlewares/audit');
exports.ibge = async (req, res) => { const d = await importacao.municipioIBGE(req.params.codigo); await audit(req, 'IMPORTACAO_IBGE', { detalhes: { codigo: req.params.codigo } }); res.json(d); };
exports.cep = async (req, res) => res.json(await importacao.municipioPorCep(req.params.cep));

exports.aneel = async (req, res) => {
  const d = await importacao.municipioANEEL(req.params.codigo);
  await audit(req, 'IMPORTACAO_ANEEL', { detalhes: { codigo: req.params.codigo } });
  res.json(d);
};
