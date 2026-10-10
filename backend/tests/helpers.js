const authService = require('../src/services/auth.service');
// Sessão válida para um papel: cookie JWT + cabeçalho CSRF
exports.sessao = (papel = 'admin', id = 1) => { const { token, csrf } = authService.emitirSessao({ id, papel }); return { cookie: `token=${token}`, csrf }; };
exports.como = (req, s) => req.set('Cookie', s.cookie).set('X-CSRF-Token', s.csrf);
