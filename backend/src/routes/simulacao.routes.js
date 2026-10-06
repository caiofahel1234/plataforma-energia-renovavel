const express = require('express');

const simulacaoController = require('../controllers/simulacao.controller');
const autenticar = require('../middlewares/auth.middleware');

const router = express.Router();

router.get('/:id', autenticar, simulacaoController.buscarPorId);

module.exports = router;