require('dotenv').config();

const {
    importarRendaPerCapita
} = require('./src/services/importacao/ibge.service');

async function main() {
    const resultado = await importarRendaPerCapita([
        {
            codigoIbge: '2927408',
            valor: 1850.50,
            anoReferencia: 2026
        },
        {
            codigoIbge: '2910800',
            valor: 1450.75,
            anoReferencia: 2026
        }
    ]);

    console.log(resultado);
}

main()
    .catch((erro) => {
        console.error(erro);
    });