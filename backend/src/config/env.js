'use strict';
// Falha rápido se faltar segredo; nunca imprime valores, só nomes das variáveis.
const { z } = require('zod');
const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string().min(1),
  DB_SSL: z.enum(['true', 'false']).default('false'),
  JWT_SECRET: z.string().min(32),
  JWT_TTL_MIN: z.coerce.number().int().min(5).max(120).default(30),
  BCRYPT_COST: z.coerce.number().int().min(10).max(15).default(12), // RNF04: custo >= 10
  CORS_ORIGINS: z.string().min(1),
  ENABLE_DOCS: z.enum(['true', 'false']).optional(), // Swagger; padrão: ligado fora de produção
});
const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  console.error('Configuração inválida. Variáveis com problema:', parsed.error.issues.map(i => i.path.join('.')).join(', '));
  process.exit(1);
}
module.exports = parsed.data;
