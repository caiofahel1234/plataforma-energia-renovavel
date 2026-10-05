const { calcularTOPSIS } = require('./src/services/topsis/topsis.service');

const matriz = [
    [10, 20],
    [20, 10],
    [15, 15]
];

const pesos = [0.5, 0.5];

const tipos = ['custo', 'beneficio'];

const resultado = calcularTOPSIS(matriz, pesos, tipos);

console.log('Coeficientes:');
console.log(resultado.coeficientes);

console.log('\nRanking:');
console.log(resultado.ranking);