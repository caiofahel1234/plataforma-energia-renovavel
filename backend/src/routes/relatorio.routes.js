const express = require('express');

const relatorioController = require('../controllers/relatorio.controller');
const autenticar = require('../middlewares/auth.middleware');

const router = express.Router();

router.get(
    '/:id/csv',
    autenticar,
    relatorioController.exportarCSV
);

router.get(
    '/:id/pdf',
    autenticar,
    relatorioController.exportarPDF
);

module.exports = router;