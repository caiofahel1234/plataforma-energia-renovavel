'use strict';
const db = require('../config/db');
// Repositório de usuários – somente consultas parametrizadas
exports.buscarPorEmail = async email => (await db.query('SELECT id, nome, email, papel, senha_hash, ativo, bloqueado_ate FROM usuarios WHERE email = $1', [email])).rows[0];
exports.buscarPorId = async id => (await db.query('SELECT id, nome, email, papel, ativo FROM usuarios WHERE id = $1', [id])).rows[0];
exports.buscarAtivoPorId = async id => (await db.query('SELECT id, nome, email, papel FROM usuarios WHERE id = $1 AND ativo', [id])).rows[0];
exports.registrarFalha = id => db.query(`UPDATE usuarios SET tentativas_falhas = tentativas_falhas + 1,
  bloqueado_ate = CASE WHEN tentativas_falhas + 1 >= 5 THEN NOW() + interval '15 minutes' ELSE bloqueado_ate END WHERE id = $1`, [id]);
exports.zerarFalhas = id => db.query('UPDATE usuarios SET tentativas_falhas = 0, bloqueado_ate = NULL WHERE id = $1', [id]);
exports.listar = async () => (await db.query('SELECT id, nome, email, papel, ativo FROM usuarios ORDER BY nome')).rows; // nunca expõe senha_hash
exports.criar = async ({ nome, email, papel, hash }) => (await db.query('INSERT INTO usuarios(nome,email,papel,senha_hash) VALUES($1,$2,$3,$4) RETURNING id, nome, email, papel, ativo', [nome, email, papel, hash])).rows[0];
exports.garantirAdmin = (email, hash) => db.query("INSERT INTO usuarios(nome,email,papel,senha_hash) VALUES('Administrador',$1,'admin',$2) ON CONFLICT (email) DO NOTHING", [email, hash]);

exports.atualizar = async (id, dados) => {
  const { rows: [u] } = await db.query(
    `UPDATE usuarios SET
       nome = COALESCE($2, nome),
       email = COALESCE($3, email),
       papel = COALESCE($4, papel),
       ativo = COALESCE($5, ativo)
     WHERE id = $1
     RETURNING id, nome, email, papel, ativo`,
    [id, dados.nome ?? null, dados.email ?? null, dados.papel ?? null, dados.ativo ?? null]
  );
  return u;
};
exports.atualizarSenha = async (id, hash) =>
  db.query('UPDATE usuarios SET senha_hash=$2, tentativas_falhas=0, bloqueado_ate=NULL WHERE id=$1', [id, hash]);
