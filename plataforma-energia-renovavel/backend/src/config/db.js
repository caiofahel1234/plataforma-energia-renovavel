'use strict';
const { Pool } = require('pg');
const env = require('./env');
// Todas as consultas do projeto usam parâmetros ($1, $2...) – nunca concatenação de strings.
module.exports = new Pool({ connectionString: env.DATABASE_URL, max: 10, ssl: env.DB_SSL === 'true' ? { rejectUnauthorized: true } : false });
