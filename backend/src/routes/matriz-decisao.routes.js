const express = require('express');

const matrizDecisaoController = require('../controllers/matriz-decisao.controller');

const router = express.Router();

router.get('/', matrizDecisaoController.listar);
router.get('/:id', matrizDecisaoController.buscarPorId);
router.post('/', matrizDecisaoController.criar);
router.put('/:id', matrizDecisaoController.atualizar);
router.delete('/:id', matrizDecisaoController.remover);

module.exports = router;