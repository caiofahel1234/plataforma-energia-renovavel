'use strict';
const auditModel = require('../models/audit.model');
// Somente Administrador: trilha de auditoria (os detalhes já são gravados sem dados sensíveis)
exports.listar = async (req, res) => res.json(await auditModel.listar(req.query.limite));
