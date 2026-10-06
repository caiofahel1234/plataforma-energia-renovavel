const coordenadasService = require('../services/municipio-coordenadas.service');

async function atualizar(req, res, next) {
    try {
        const { latitude, longitude } = req.body;

        const resultado =
            await coordenadasService.atualizarCoordenadas(
                req.params.id,
                latitude,
                longitude
            );

        res.json(resultado);
    } catch (erro) {
        next(erro);
    }
}

async function listar(req, res, next) {
    try {
        const municipios =
            await coordenadasService.listarComCoordenadas();

        res.json(municipios);
    } catch (erro) {
        next(erro);
    }
}

module.exports = {
    atualizar,
    listar
};