'use strict';
const municipios = require('../models/municipio.model');
const { audit } = require('../middlewares/audit');
exports.listar = async (req, res) => res.json(await municipios.listarMatriz());
exports.criar = async (req, res) => { // UC01
  const id = await municipios.criar(req.body);
  await audit(req, 'MUNICIPIO_CRIADO', { entidade: 'municipios', entidadeId: id, detalhes: { nome: req.body.nome, uf: req.body.uf } });
  res.status(201).json({ id });
};
exports.excluir = async (req, res) => {
  if (!await municipios.excluir(req.params.id)) return res.status(404).json({ erro: 'Recurso não encontrado' });
  await audit(req, 'MUNICIPIO_EXCLUIDO', { entidade: 'municipios', entidadeId: req.params.id });
  res.status(204).end();
};
