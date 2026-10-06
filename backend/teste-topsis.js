require('dotenv').config();

console.log('DATABASE_URL existe:', !!process.env.DATABASE_URL);

console.log(
    'DATABASE_URL:',
    process.env.DATABASE_URL?.replace(/:[^:@]+@/, ':****@')
);

const prisma = require('./src/lib/prisma');

const {
    calcularTOPSIS,
    prepararDadosTOPSIS
} = require('./src/services/topsis/topsis.service');

async function main() {
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

    console.log('\nDados encontrados no banco:');
    console.log(dados);

    const preparados = prepararDadosTOPSIS(dados);

    console.log('\nMatriz:');
    console.log(preparados.matriz);

    console.log('\nPesos:');
    console.log(preparados.pesos);

    console.log('\nTipos:');
    console.log(preparados.tipos);

    const resultado = calcularTOPSIS(
        preparados.matriz,
        preparados.pesos,
        preparados.tipos
    );

    console.log('\nCoeficientes:');
    console.log(resultado.coeficientes);

    console.log('\nRanking:');
    console.log(resultado.ranking);
}

main()
    .catch((erro) => {
        console.error('Erro:', erro);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });