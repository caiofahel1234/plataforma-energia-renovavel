'use strict';
const fs = require('fs'), path = require('path');
const db = require('../src/config/db');
(async () => {
  for (const f of fs.readdirSync(path.join(__dirname, '../migrations')).sort()) { await db.query(fs.readFileSync(path.join(__dirname, '../migrations', f), 'utf8')); console.log('ok', f); }
  await db.end();
})().catch(e => { console.error('Falha na migration:', e.code || e.message); process.exit(1); });
