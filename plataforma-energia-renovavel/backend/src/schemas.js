'use strict';
const { z } = require('zod');
const limpa = s => s.replace(/[\u0000-\u001f\u007f]/g, '').trim();
// Texto livre: remove controle e rejeita caracteres de marcação (defesa em profundidade contra XSS)
const texto = (min, max) => z.string().transform(limpa).pipe(z.string().min(min).max(max).regex(/^[^<>"`\\]*$/));
const senhaForte = z.string().min(12).max(72).regex(/[a-z]/).regex(/[A-Z]/).regex(/\d/).regex(/[^A-Za-z0-9]/);
const email = z.string().max(254).email().transform(s => s.toLowerCase().trim());
const id = z.coerce.number().int().positive();
const valor = z.number().finite().min(-1e12).max(1e12);
const PAPEIS = ['admin', 'pesquisador', 'gestor'];

exports.PAPEIS = PAPEIS;
exports.idParam = z.object({ id }).strict();
exports.loginSchema = z.object({ email, senha: z.string().min(1).max(72) }).strict();
exports.usuarioSchema = z.object({ nome: texto(2, 120), email, papel: z.enum(PAPEIS), senha: senhaForte }).strict();
exports.usuarioAtualizacaoSchema = z.object({
  nome: texto(2, 120).optional(),
  email: email.optional(),
  papel: z.enum(PAPEIS).optional(),
  ativo: z.boolean().optional(),
}).strict();
exports.usuarioSenhaSchema = z.object({ senha: senhaForte }).strict();
exports.senhaForte = senhaForte;
exports.municipioSchema = z.object({
  nome: texto(2, 120), uf: z.string().regex(/^[A-Z]{2}$/), populacao: z.number().int().min(0).max(2e8),
  idh: z.number().min(0).max(1).nullable().optional(), lat: z.number().min(-90).max(90), lng: z.number().min(-180).max(180),
  values: z.record(z.string().regex(/^\d+$/), valor).default({}),
}).strict();
exports.criterioSchema = z.object({
  nome: texto(2, 150), descricao: texto(0, 500).optional(), tipo: z.enum(['beneficio', 'custo']),
  unidade: texto(0, 50).optional(), peso: z.number().min(0).max(1).default(0),
}).strict();
exports.topsisSchema = z.object({
  criterios: z.array(z.object({ id: z.number().int().positive(), tipo: z.enum(['beneficio', 'custo']), peso: z.number().min(0).max(1) }).strict()).min(2).max(50),
  municipioIds: z.array(z.number().int().positive()).max(500).optional(),
}).strict();
exports.ibgeParam = z.object({ codigo: z.string().regex(/^\d{7}$/) }).strict();
exports.cepParam = z.object({ cep: z.string().regex(/^\d{8}$/) }).strict();
exports.aneelParam = z.object({ codigo: z.string().regex(/^\d{7}$/) }).strict();
exports.auditoriaQuery = z.object({ limite: z.coerce.number().int().min(1).max(200).default(50) }).strict();
