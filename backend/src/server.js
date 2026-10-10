'use strict';
const env = require('./config/env');
const logger = require('./config/logger');
const db = require('./config/db');
const app = require('./app');
const { ensureAdmin } = require('./bootstrap');

(async () => {
  try {
    if (await ensureAdmin()) logger.info('admin inicial garantido');
    const server = app.listen(env.PORT, () => logger.info(`API na porta ${env.PORT}`));
    const shutdown = signal => {
      logger.info({ signal }, 'encerrando servidor');
      server.close(async () => { try { await db.end(); } finally { process.exit(0); } });
    };
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (e) {
    logger.error({ message: e.message }, 'falha ao iniciar API');
    await db.end();
    process.exit(1);
  }
})();
process.on('unhandledRejection', e => logger.error({ message: e && e.message }, 'unhandledRejection'));
process.on('uncaughtException', e => { logger.error({ message: e.message }, 'uncaughtException'); process.exit(1); });
