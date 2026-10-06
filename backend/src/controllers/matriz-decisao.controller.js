const matrizDecisaoService = require('../services/matriz-decisao.service');

async function listar(req, res, next) {
    try {
        const matriz = await matrizDecisaoService.listarMatriz();

        res.json(matriz);
    } catch (error) {
        next(error);
    }
}

async function buscarPorId(req, res, next) {
    try {
        const id = Number(req.params.id);

        const registro = await matrizDecisaoService.buscarMatriz(id);

        res.json(registro);
    } catch (error) {
        next(error);
    }
}

async function criar(req, res, next) {
    try {
        const registro = await matrizDecisaoService.criarMatriz(req.body);

        res.status(201).json(registro);
    } catch (error) {
        next(error);
    }
}

async function atualizar(req, res, next) {
    try {
        const id = Number(req.params.id);

        const registro = await matrizDecisaoService.atualizarMatriz(
            id,
            req.body
        );

        res.json(registro);
    } catch (error) {
        next(error);
    }
}

async function remover(req, res, next) {
    try {
        const id = Number(req.params.id);

        await matrizDecisaoService.removerMatriz(id);

        res.status(204).send();
    } catch (error) {
        next(error);
    }
}

async function importar(req, res, next) {
    try {
        const resultado =
            await matrizDecisaoService.importarMatriz(
                req.body.dados
            );

        res.status(201).json({
            message: 'Dados importados com sucesso',
            quantidade: resultado.count
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    listar,
    buscarPorId,
    criar,
    atualizar,
    remover,
    importar
};