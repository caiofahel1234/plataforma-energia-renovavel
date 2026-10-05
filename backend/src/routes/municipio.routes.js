const express = require('express');

const municipioController = require('../controllers/municipio.controller');

const router = express.Router();

router.get('/', municipioController.listar);
router.get('/:id', municipioController.buscarPorId);
router.post('/', municipioController.criar);
router.put('/:id', municipioController.atualizar);
router.delete('/:id', municipioController.remover);

module.exports = router;