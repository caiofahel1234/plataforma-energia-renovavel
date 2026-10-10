'use strict';
// Rotas finas: caminho + middlewares (autenticação, RBAC, validação) + controller
const router = require('express').Router();
const h = require('../utils/asyncHandler');
const { validate } = require('../middlewares/validate');
const S = require('../schemas');
const { authenticate, authorize } = require('../middlewares/auth');
const { loginLimiter } = require('../middlewares/security');
const auth = require('../controllers/auth.controller');
const usuarios = require('../controllers/usuarios.controller');
const municipios = require('../controllers/municipios.controller');
const criterios = require('../controllers/criterios.controller');
const topsis = require('../controllers/topsis.controller');
const simulacoes = require('../controllers/simulacoes.controller');
const relatorios = require('../controllers/relatorios.controller');
const importacao = require('../controllers/importacao.controller');
const auditoria = require('../controllers/auditoria.controller');
const ADM = authorize('admin'), CRIT = authorize('admin', 'pesquisador'), TODOS = authorize('admin', 'pesquisador', 'gestor');
const id = validate(S.idParam, 'params');

router.post('/auth/login', loginLimiter, validate(S.loginSchema), h(auth.login));
router.get('/auth/me', authenticate, h(auth.me));
router.post('/auth/logout', authenticate, auth.logout);
router.get('/usuarios', authenticate, ADM, h(usuarios.listar));                                  // RF08
router.post('/usuarios', authenticate, ADM, validate(S.usuarioSchema), h(usuarios.criar));
router.put('/usuarios/:id', authenticate, ADM, id, validate(S.usuarioAtualizacaoSchema), h(usuarios.atualizar));
router.patch('/usuarios/:id/senha', authenticate, ADM, id, validate(S.usuarioSenhaSchema), h(usuarios.atualizarSenha));
router.get('/municipios', authenticate, h(municipios.listar));                                   // RF01
router.post('/municipios', authenticate, ADM, validate(S.municipioSchema), h(municipios.criar)); // UC01
router.delete('/municipios/:id', authenticate, ADM, id, h(municipios.excluir));
router.get('/criterios', authenticate, h(criterios.listar));                                     // RF02
router.post('/criterios', authenticate, CRIT, validate(S.criterioSchema), h(criterios.criar));   // UC02
router.put('/criterios/:id', authenticate, CRIT, id, validate(S.criterioSchema.partial()), h(criterios.atualizar));
router.delete('/criterios/:id', authenticate, CRIT, id, h(criterios.excluir));
router.post('/topsis/executar', authenticate, TODOS, validate(S.topsisSchema), h(topsis.executar)); // UC03
router.get('/simulacoes', authenticate, h(simulacoes.listar));                                   // RF10
router.get('/simulacoes/:id', authenticate, id, h(simulacoes.obter));
router.get('/relatorios/:id/pdf', authenticate, TODOS, id, h(relatorios.pdf));                   // UC04
router.get('/relatorios/:id/csv', authenticate, TODOS, id, h(relatorios.csv));
router.get('/importacao/ibge/:codigo', authenticate, ADM, validate(S.ibgeParam, 'params'), h(importacao.ibge)); // RF09
router.get('/importacao/cep/:cep', authenticate, ADM, validate(S.cepParam, 'params'), h(importacao.cep));
router.get('/importacao/aneel/:codigo', authenticate, ADM, validate(S.aneelParam, 'params'), h(importacao.aneel));
router.get('/auditoria', authenticate, ADM, validate(S.auditoriaQuery, 'query'), h(auditoria.listar));   // trilha de auditoria (admin)
module.exports = router;
