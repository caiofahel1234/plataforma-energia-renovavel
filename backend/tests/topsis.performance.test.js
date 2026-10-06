const {
    calcularTOPSIS
} = require('../src/services/topsis/topsis.service');

describe('Performance do TOPSIS', () => {
    test('deve processar 500 alternativas com 7 critérios em menos de 3 segundos', () => {
        const quantidadeMunicipios = 500;
        const quantidadeCriterios = 7;

        const matriz = Array.from(
            { length: quantidadeMunicipios },
            (_, i) =>
                Array.from(
                    { length: quantidadeCriterios },
                    (_, j) => (i + 1) * (j + 1)
                )
        );

        const pesos = [
            0.15,
            0.15,
            0.15,
            0.15,
            0.15,
            0.15,
            0.10
        ];

        const tipos = [
            'custo',
            'beneficio',
            'beneficio',
            'custo',
            'beneficio',
            'custo',
            'beneficio'
        ];

        const inicio = process.hrtime.bigint();

        const resultado = calcularTOPSIS(
            matriz,
            pesos,
            tipos
        );

        const fim = process.hrtime.bigint();

        const tempoMs = Number(fim - inicio) / 1_000_000;

        console.log(`\nTOPSIS com 500 alternativas: ${tempoMs.toFixed(2)} ms`);

        expect(resultado.ranking).toHaveLength(500);
        expect(resultado.coeficientes).toHaveLength(500);
        expect(tempoMs).toBeLessThan(3000);
    });
});