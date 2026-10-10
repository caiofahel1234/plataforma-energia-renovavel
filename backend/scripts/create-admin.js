'use strict';
const { ensureAdmin } = require('../src/bootstrap');
const db = require('../src/config/db');
ensureAdmin().then(ok => { console.log(ok ? 'Admin garantido.' : 'Defina ADMIN_EMAIL e ADMIN_PASSWORD.'); return db.end(); }).catch(e => { console.error(e.message); process.exit(1); });
