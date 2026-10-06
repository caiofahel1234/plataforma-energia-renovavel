const { executarTOPSIS } = require('../services/topsis/topsis-execucao.service');

async function executar(req, res, next) {
    try {
        const usuarioId = req.usuario.id;

        const resultado = await executarTOPSIS(usuarioId);

        res.status(201).json(resultado);
    } catch (erro) {
        next(erro);
    }
}

module.exports = {
    executar
};