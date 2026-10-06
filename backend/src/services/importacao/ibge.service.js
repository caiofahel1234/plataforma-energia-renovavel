const prisma = require('../../lib/prisma');

const CRITERIOS_IBGE = {
    2: '% domicílios sem acesso à eletricidade',
    4: 'Renda per capita',
    7: 'População em extrema pobreza'
};

async function importarDados(dados, criterioId) {
    if (!Array.isArray(dados) || dados.length === 0) {
        const erro = new Error(
            'Os dados do IBGE devem ser informados em uma lista'
        );
        erro.status = 400;
        throw erro;
    }

    if (!CRITERIOS_IBGE[criterioId]) {
        const erro = new Error(
            'Critério não permitido para importação do IBGE'
        );
        erro.status = 400;
        throw erro;
    }

    const criterio = await prisma.criterio.findUnique({
        where: {
            id: criterioId
        }
    });

    if (!criterio) {
        const erro = new Error('Critério não encontrado');
        erro.status = 404;
        throw erro;
    }

    const registros = [];

    for (const item of dados) {
        if (!item.codigoIbge || item.valor === undefined) {
            const erro = new Error(
                'Cada registro deve possuir codigoIbge e valor'
            );
            erro.status = 400;
            throw erro;
        }

        const valor = Number(item.valor);

        if (!Number.isFinite(valor)) {
            const erro = new Error(
                `Valor inválido para o município ${item.codigoIbge}`
            );
            erro.status = 400;
            throw erro;
        }

        const municipio = await prisma.municipio.findUnique({
            where: {
                codigoIbge: String(item.codigoIbge)
            }
        });

        if (!municipio) {
            const erro = new Error(
                `Município com código IBGE ${item.codigoIbge} não encontrado`
            );
            erro.status = 404;
            throw erro;
        }

        registros.push({
            municipioId: municipio.id,
            criterioId,
            valor,
            anoReferencia: item.anoReferencia
                ? Number(item.anoReferencia)
                : null
        });
    }

    return prisma.matrizDecisao.createMany({
        data: registros,
        skipDuplicates: true
    });
}

module.exports = {
    importarDados
};