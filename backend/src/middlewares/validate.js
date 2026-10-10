'use strict';
// Validação server-side estrita (schemas .strict() rejeitam campos extras => sem mass assignment)
exports.validate = (schema, where = 'body') => (req, res, next) => {
  const r = schema.safeParse(req[where]);
  if (!r.success) return res.status(400).json({ erro: 'Dados inválidos', campos: r.error.issues.map(i => i.path.join('.')) });
  req[where] = r.data; next();
};
