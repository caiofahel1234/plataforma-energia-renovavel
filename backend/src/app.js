'use strict';
const express = require('express');
const cookieParser = require('cookie-parser');
const crypto = require('crypto');
const helmet = require('helmet');
const env = require('./config/env');
const { helmetMw, corsMw, globalLimiter } = require('./middlewares/security');
const errorHandler = require('./middlewares/errorHandler');
const db = require('./config/db');
const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 1); // atrás do Nginx
app.use((req, res, next) => { req.id = crypto.randomUUID(); res.setHeader('X-Request-Id', req.id); next(); });
// Swagger/OpenAPI (RNF06): CSP própria e restrita à UI de documentação; desligável em produção (ENABLE_DOCS)
if ((env.ENABLE_DOCS ?? String(env.NODE_ENV !== 'production')) === 'true') {
  const swaggerUi = require('swagger-ui-express'), YAML = require('yaml'), fs = require('fs'), path = require('path');
  const spec = YAML.parse(fs.readFileSync(path.join(__dirname, 'docs/openapi.yaml'), 'utf8'));
  app.use('/api/docs', helmet({ contentSecurityPolicy: { useDefaults: false, directives: { defaultSrc: ["'none'"], scriptSrc: ["'self'"], styleSrc: ["'self'", "'unsafe-inline'"], imgSrc: ["'self'", 'data:'], connectSrc: ["'self'"], fontSrc: ["'self'"], frameAncestors: ["'none'"] } } }), swaggerUi.serve, swaggerUi.setup(spec, { customSiteTitle: 'VSE TOPSIS – API' }));
}
app.use(helmetMw, corsMw, globalLimiter, express.json({ limit: '1mb' }), cookieParser());
app.use('/api', (req, res, next) => { res.setHeader('Cache-Control', 'no-store'); next(); });
app.get('/api/health', async (req, res) => {
  try {
    await db.query('SELECT 1');
    res.json({ status: 'ok', database: 'ok' });
  } catch {
    res.status(503).json({ status: 'degraded', database: 'unavailable' });
  }
});
app.use('/api', require('./routes'));
app.use((req, res) => res.status(404).json({ erro: 'Recurso não encontrado' }));
app.use(errorHandler);
module.exports = app;
