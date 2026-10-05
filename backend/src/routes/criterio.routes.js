const express = require('express');

const criterioController = require('../controllers/criterio.controller');

const router = express.Router();

router.get('/', criterioController.listar);
router.get('/:id', criterioController.buscarPorId);
router.post('/', criterioController.criar);
router.put('/:id', criterioController.atualizar);
router.delete('/:id', criterioController.remover);

module.exports = router;