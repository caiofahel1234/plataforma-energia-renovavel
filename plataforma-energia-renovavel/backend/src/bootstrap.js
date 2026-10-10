'use strict';
// Admin inicial por variáveis de ambiente (idempotente). Sem credenciais padrão no código.
const usuarios = require('./models/usuario.model');
const authService = require('./services/auth.service');
const { senhaForte } = require('./schemas');
exports.ensureAdmin = async (env = process.env) => {
  if (!env.ADMIN_EMAIL || !env.ADMIN_PASSWORD) return false;
  if (!senhaForte.safeParse(env.ADMIN_PASSWORD).success) throw new Error('ADMIN_PASSWORD não atende à política de senha');
  await usuarios.garantirAdmin(env.ADMIN_EMAIL.toLowerCase(), await authService.hash(env.ADMIN_PASSWORD));
  return true;
};
