'use strict';
const usuarios = require('../models/usuario.model');
const authService = require('../services/auth.service');
const { cookieOpts } = require('../middlewares/auth');
const { audit, hashId } = require('../middlewares/audit');

exports.login = async (req, res) => {
  const { email, senha } = req.body;
  const u = await usuarios.buscarPorEmail(email);
  const bloqueado = u && u.bloqueado_ate && u.bloqueado_ate > new Date();
  const ok = await authService.conferir(senha, u && u.senha_hash);
  if (!u || !ok || !u.ativo || bloqueado) {
    if (u && !ok && !bloqueado) await usuarios.registrarFalha(u.id);
    await audit(req, 'LOGIN_FALHA', { usuarioId: u ? u.id : null, detalhes: { emailHash: hashId(email) } });
    return res.status(401).json({ erro: 'Credenciais inválidas' }); // mensagem única
  }
  await usuarios.zerarFalhas(u.id);
  const { token, csrf } = authService.emitirSessao(u);
  res.cookie('token', token, cookieOpts); // httpOnly + Secure(prod) + SameSite=Strict
  await audit(req, 'LOGIN_OK', { usuarioId: u.id });
  res.json({ user: { id: u.id, nome: u.nome, email: u.email, papel: u.papel }, csrf });
};
exports.me = async (req, res) => {
  const u = await usuarios.buscarAtivoPorId(req.user.id);
  if (!u) return res.status(401).json({ erro: 'Não autenticado' });
  res.json({ user: u, csrf: req.user.csrf });
};
exports.logout = async (req, res) => { await audit(req, 'LOGOUT'); res.clearCookie('token', { ...cookieOpts, maxAge: undefined }); res.status(204).end(); };
