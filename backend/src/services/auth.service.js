'use strict';
const bcrypt = require('bcrypt'), jwt = require('jsonwebtoken'), crypto = require('crypto');
const env = require('../config/env');
const DUMMY = bcrypt.hashSync('hash-para-equalizar-tempo', env.BCRYPT_COST);
exports.hash = senha => bcrypt.hash(senha, env.BCRYPT_COST); // RNF04: custo >= 10
exports.conferir = (senha, hash) => bcrypt.compare(senha, hash || DUMMY); // compara sempre => sem enumeração por tempo
exports.emitirSessao = u => {
  const csrf = crypto.randomBytes(24).toString('hex');
  const token = jwt.sign({ papel: u.papel, csrf }, env.JWT_SECRET, { subject: String(u.id), expiresIn: env.JWT_TTL_MIN * 60, algorithm: 'HS256', issuer: 'vse-api' });
  return { token, csrf };
};
