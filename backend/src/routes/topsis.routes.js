const express = require('express');

const topsisController = require('../controllers/topsis.controller');
const autenticar = require('../middlewares/auth.middleware');

const router = express.Router();

router.post('/executar', autenticar, topsisController.executar);

module.exports = router;