const express = require('express');

const matrizDecisaoController = require('../controllers/matriz-decisao.controller');
const autenticar = require('../middlewares/auth.middleware');

const router = express.Router();

router.get(
    '/',
    autenticar,
    matrizDecisaoController.listar
);

router.post(
    '/importar',
    autenticar,
    matrizDecisaoController.importar
);

router.get(
    '/:id',
    autenticar,
    matrizDecisaoController.buscarPorId
);

router.post(
    '/',
    autenticar,
    matrizDecisaoController.criar
);

router.put(
    '/:id',
    autenticar,
    matrizDecisaoController.atualizar
);

router.delete(
    '/:id',
    autenticar,
    matrizDecisaoController.remover
);

module.exports = router;