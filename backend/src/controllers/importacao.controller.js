const ibgeService = require('../services/importacao/ibge.service');
const aneelService = require('../services/importacao/aneel.service');

async function importarIBGE(req, res, next) {
    try {
        const criterioId = Number(req.params.criterioId);

        const resultado = await ibgeService.importarDados(
            req.body.dados,
            criterioId
        );

        res.status(201).json({
            message: 'Dados do IBGE importados com sucesso',
            quantidade: resultado.count,
            criterioId
        });
    } catch (error) {
        next(error);
    }
}

async function importarANEEL(req, res, next) {
    try {
        const criterioId = Number(req.params.criterioId);

        const resultado = await aneelService.importarDados(
            req.body.dados,
            criterioId
        );

        res.status(201).json({
            message: 'Dados da ANEEL importados com sucesso',
            quantidade: resultado.count,
            criterioId
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    importarIBGE,
    importarANEEL
};