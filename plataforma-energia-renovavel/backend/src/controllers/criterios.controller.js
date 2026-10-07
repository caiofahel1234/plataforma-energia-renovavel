'use strict';
const criterios = require('../models/criterio.model');
const { audit } = require('../middlewares/audit');
exports.listar = async (req, res) => res.json(await criterios.listar());
exports.criar = async (req, res) => { // UC02 / RF02
  const id = await criterios.criar(req.body);
  await audit(req, 'CRITERIO_CRIADO', { entidade: 'criterios', entidadeId: id, detalhes: { nome: req.body.nome, tipo: req.body.tipo, peso: req.body.peso } });
  res.status(201).json({ id });
};
exports.atualizar = async (req, res) => { // RF03: pesos e tipos
  const antes = await criterios.obter(req.params.id);
  if (!antes) return res.status(404).json({ erro: 'Recurso não encontrado' });
  await criterios.atualizar(req.params.id, req.body);
  const { nome, tipo, peso } = req.body;
  await audit(req, 'PARAMETROS_TOPSIS_ALTERADOS', { entidade: 'criterios', entidadeId: req.params.id, detalhes: { antes, depois: { nome, tipo, peso } } });
  res.status(204).end();
};
exports.excluir = async (req, res) => {
  if (!await criterios.excluir(req.params.id)) return res.status(404).json({ erro: 'Recurso não encontrado' });
  await audit(req, 'CRITERIO_EXCLUIDO', { entidade: 'criterios', entidadeId: req.params.id });
  res.status(204).end();
};
