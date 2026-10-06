const express = require('express');

const criterioController = require('../controllers/criterio.controller');
const autenticar = require('../middlewares/auth.middleware');
const autorizar = require('../middlewares/autorizar.middleware');

const router = express.Router();

router.get('/', criterioController.listar);

router.get('/:id', criterioController.buscarPorId);

router.post(
    '/',
    autenticar,
    criterioController.criar
);

router.put(
    '/pesos',
    autenticar,
    autorizar('admin'),
    criterioController.atualizarPesos
);

router.put(
    '/:id',
    autenticar,
    criterioController.atualizar
);

router.delete(
    '/:id',
    autenticar,
    criterioController.remover
);

module.exports = router;