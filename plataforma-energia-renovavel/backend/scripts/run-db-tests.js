'use strict';
process.env.RUN_DB_TESTS = '1';
const { spawnSync } = require('child_process');
const bin = process.platform === 'win32' ? 'npx.cmd' : 'npx';
const r = spawnSync(bin, ['jest', '--runInBand', '--coverage'], { stdio: 'inherit', shell: false });
process.exit(r.status ?? 1);
