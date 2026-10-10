'use strict';
const fs = require('fs'), path = require('path'), db = require('../src/config/db');
db.query(fs.readFileSync(path.join(__dirname, '../seeds/demo.sql'), 'utf8')).then(() => { console.log('seed demo ok'); return db.end(); }).catch(e => { console.error(e.code || e.message); process.exit(1); });
