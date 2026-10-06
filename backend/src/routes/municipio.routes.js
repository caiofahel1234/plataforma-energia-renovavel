const express = require('express');

const municipioController = require('../controllers/municipio.controller');
const coordenadasController = require('../controllers/municipio-coordenadas.controller');
const autenticar = require('../middlewares/auth.middleware');

const router = express.Router();

router.get('/', municipioController.listar);

// Rota do mapa — precisa ficar antes de /:id
router.get(
    '/mapa',
    autenticar,
    coordenadasController.listar
);

router.get('/:id', municipioController.buscarPorId);

router.post(
    '/',
    autenticar,
    municipioController.criar
);

router.put(
    '/:id',
    autenticar,
    municipioController.atualizar
);

router.delete(
    '/:id',
    autenticar,
    municipioController.remover
);

router.patch(
    '/:id/coordenadas',
    autenticar,
    coordenadasController.atualizar
);

module.exports = router;