'use strict';
const simulacoes = require('../models/simulacao.model');
exports.listar = async (req, res) => res.json(await simulacoes.listar({ admin: req.user.papel === 'admin', usuarioId: req.user.id })); // RF10
exports.obter = async (req, res) => {
  const s = await simulacoes.obter(req.params.id, req.user);
  if (!s) return res.status(404).json({ erro: 'Recurso não encontrado' });
  res.json(s);
};
