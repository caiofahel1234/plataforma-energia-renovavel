const municipioService = require('../services/municipio.service');
const prisma = require('../lib/prisma');

async function listar(req, res, next) {
    try {
        const municipios = await municipioService.listarMunicipios();

        res.json(municipios);
    } catch (error) {
        next(error);
    }
}

async function buscarPorId(req, res, next) {
    try {
        const id = Number(req.params.id);

        const municipio = await municipioService.buscarMunicipio(id);

        res.json(municipio);
    } catch (error) {
        next(error);
    }
}

async function criar(req, res, next) {
    try {
        const municipio = await municipioService.criarMunicipio(req.body);

        res.status(201).json(municipio);
    } catch (error) {
        next(error);
    }
}

async function atualizar(req, res, next) {
    try {
        const id = Number(req.params.id);

        const municipio = await municipioService.atualizarMunicipio(
            id,
            req.body
        );

        res.json(municipio);
    } catch (error) {
        next(error);
    }
}

async function remover(req, res, next) {
    try {
        const id = Number(req.params.id);

        await municipioService.removerMunicipio(id);

        res.status(204).send();
    } catch (error) {
        next(error);
    }
}

async function listarComCoordenadas(req, res, next) {
    try {
        const municipios = await prisma.$queryRaw`
            SELECT
                id,
                nome,
                uf,
                populacao,
                idh,
                ST_Y(coordenadas) AS latitude,
                ST_X(coordenadas) AS longitude
            FROM municipios
            WHERE coordenadas IS NOT NULL
            ORDER BY nome;
        `;

        res.json(municipios);
    } catch (erro) {
        next(erro);
    }
}

module.exports = {
    listar,
    buscarPorId,
    criar,
    atualizar,
    remover,
    listarComCoordenadas
};