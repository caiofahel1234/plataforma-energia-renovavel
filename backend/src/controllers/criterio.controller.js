const criterioService = require('../services/criterio.service');

async function listar(req, res, next) {
    try {
        const criterios = await criterioService.listarCriterios();

        res.json(criterios);
    } catch (error) {
        next(error);
    }
}

async function buscarPorId(req, res, next) {
    try {
        const id = Number(req.params.id);

        const criterio = await criterioService.buscarCriterio(id);

        res.json(criterio);
    } catch (error) {
        next(error);
    }
}

async function criar(req, res, next) {
    try {
        const criterio = await criterioService.criarCriterio(req.body);

        res.status(201).json(criterio);
    } catch (error) {
        next(error);
    }
}

async function atualizar(req, res, next) {
    try {
        const id = Number(req.params.id);

        const criterio = await criterioService.atualizarCriterio(
            id,
            req.body
        );

        res.json(criterio);
    } catch (error) {
        next(error);
    }
}

async function remover(req, res, next) {
    try {
        const id = Number(req.params.id);

        await criterioService.removerCriterio(id);

        res.status(204).send();
    } catch (error) {
        next(error);
    }
}

module.exports = {
    listar,
    buscarPorId,
    criar,
    atualizar,
    remover
};