'use strict';
const usuarios = require('../models/usuario.model');
const authService = require('../services/auth.service');
const { audit } = require('../middlewares/audit');

exports.listar = async (req, res) => res.json(await usuarios.listar());

exports.criar = async (req, res) => {
  const { nome, email, papel, senha } = req.body;
  const u = await usuarios.criar({ nome, email, papel, hash: await authService.hash(senha) });
  await audit(req, 'USUARIO_CRIADO', { entidade: 'usuarios', entidadeId: u.id, detalhes: { papel } });
  res.status(201).json(u);
};

exports.atualizar = async (req, res) => {
  if (Number(req.params.id) === Number(req.user.id) && req.body.ativo === false)
    return res.status(400).json({ erro: 'Não é permitido desativar o próprio usuário' });
  const antes = await usuarios.buscarPorId(req.params.id);
  if (!antes) return res.status(404).json({ erro: 'Recurso não encontrado' });
  const u = await usuarios.atualizar(req.params.id, req.body);
  if (!u) return res.status(404).json({ erro: 'Recurso não encontrado' });
  await audit(req, 'USUARIO_ATUALIZADO', {
    entidade: 'usuarios', entidadeId: u.id,
    detalhes: { antes: { nome: antes.nome, email: antes.email, papel: antes.papel }, depois: { nome: u.nome, email: u.email, papel: u.papel, ativo: u.ativo } }
  });
  res.json(u);
};

exports.atualizarSenha = async (req, res) => {
  const u = await usuarios.buscarAtivoPorId(req.params.id);
  if (!u) return res.status(404).json({ erro: 'Recurso não encontrado' });
  await usuarios.atualizarSenha(req.params.id, await authService.hash(req.body.senha));
  await audit(req, 'SENHA_USUARIO_ALTERADA', { entidade: 'usuarios', entidadeId: u.id });
  res.status(204).end();
};
