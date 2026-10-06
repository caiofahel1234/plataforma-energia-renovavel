const prisma = require('../../lib/prisma');

const {
    calcularTOPSIS,
    prepararDadosTOPSIS
} = require('./topsis.service');

async function executarTOPSIS(usuarioId) {
    const dados = await prisma.matrizDecisao.findMany({
        orderBy: [
            {
                municipioId: 'asc'
            },
            {
                criterioId: 'asc'
            }
        ],
        include: {
            municipio: true,
            criterio: true
        }
    });

    if (dados.length === 0) {
        throw new Error('Não existem dados para executar o TOPSIS');
    }

    const preparados = prepararDadosTOPSIS(dados);

    const resultado = calcularTOPSIS(
        preparados.matriz,
        preparados.pesos,
        preparados.tipos
    );

    const simulacao = await prisma.simulacao.create({
        data: {
            usuarioId,
            parametros: {
                pesos: preparados.pesos,
                tipos: preparados.tipos
            },
            status: 'concluida'
        }
    });

    const resultadosRanking = resultado.ranking.map(
        (item, indiceRanking) => {
            const municipio = preparados.municipios[item.indice];

            const distancia =
                resultado.distancias[item.indice];

            return {
                simulacaoId: simulacao.id,
                municipioId: municipio.id,
                coeficienteCi: item.coeficiente,
                distanciaPositiva: distancia.distanciaPositiva,
                distanciaNegativa: distancia.distanciaNegativa,
                posicao: indiceRanking + 1
            };
        }
    );

    await prisma.resultadoRanking.createMany({
        data: resultadosRanking
    });

    return {
        simulacao,
        ranking: resultadosRanking.map((resultado) => ({
            municipioId: resultado.municipioId,
            coeficienteCi: resultado.coeficienteCi,
            distanciaPositiva: resultado.distanciaPositiva,
            distanciaNegativa: resultado.distanciaNegativa,
            posicao: resultado.posicao
        }))
    };
}

module.exports = {
    executarTOPSIS
};