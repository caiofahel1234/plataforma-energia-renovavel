const express = require('express');

const importacaoController = require('../controllers/importacao.controller');
const autenticar = require('../middlewares/auth.middleware');

const router = express.Router();

router.post(
    '/ibge/:criterioId',
    autenticar,
    importacaoController.importarIBGE
);

router.post(
    '/aneel/:criterioId',
    autenticar,
    importacaoController.importarANEEL
);

module.exports = router;