const {
    calcularTOPSIS,
    prepararDadosTOPSIS
} = require('../src/services/topsis/topsis.service');

describe('Serviço TOPSIS', () => {

    test('deve calcular o TOPSIS e ordenar o ranking corretamente', () => {
        const matriz = [
            [10, 8],
            [6, 4],
            [8, 6]
        ];

        const pesos = [0.5, 0.5];
        const tipos = ['beneficio', 'beneficio'];

        const resultado = calcularTOPSIS(
            matriz,
            pesos,
            tipos
        );

        expect(resultado.coeficientes).toHaveLength(3);
        expect(resultado.ranking).toHaveLength(3);
        expect(resultado.ranking[0].indice).toBe(0);
        expect(resultado.ranking[2].indice).toBe(1);
    });

    test('deve considerar corretamente critérios de custo', () => {
        const matriz = [
            [10, 5],
            [5, 10]
        ];

        const pesos = [0.5, 0.5];
        const tipos = ['beneficio', 'custo'];

        const resultado = calcularTOPSIS(
            matriz,
            pesos,
            tipos
        );

        expect(resultado.ranking[0].indice).toBe(0);
        expect(resultado.ranking[1].indice).toBe(1);
    });

    test('deve rejeitar matriz vazia', () => {
        expect(() => {
            calcularTOPSIS([], [0.5], ['beneficio']);
        }).toThrow('Matriz de decisão vazia');
    });

    test('deve rejeitar quantidade incorreta de pesos', () => {
        expect(() => {
            calcularTOPSIS(
                [[10, 20], [30, 40]],
                [1],
                ['beneficio', 'beneficio']
            );
        }).toThrow('Quantidade de pesos incompatível com a matriz');
    });

    test('deve rejeitar quantidade incorreta de tipos', () => {
        expect(() => {
            calcularTOPSIS(
                [[10, 20], [30, 40]],
                [0.5, 0.5],
                ['beneficio']
            );
        }).toThrow('Quantidade de tipos incompatível com a matriz');
    });

    test('deve preparar os dados do TOPSIS corretamente', () => {
        const dados = [
            {
                municipioId: 1,
                criterioId: 1,
                valor: 100,
                municipio: { id: 1, nome: 'Salvador' },
                criterio: {
                    id: 1,
                    peso: 0.6,
                    tipo: 'beneficio'
                }
            },
            {
                municipioId: 1,
                criterioId: 2,
                valor: 50,
                municipio: { id: 1, nome: 'Salvador' },
                criterio: {
                    id: 2,
                    peso: 0.4,
                    tipo: 'custo'
                }
            },
            {
                municipioId: 2,
                criterioId: 1,
                valor: 80,
                municipio: { id: 2, nome: 'Feira' },
                criterio: {
                    id: 1,
                    peso: 0.6,
                    tipo: 'beneficio'
                }
            },
            {
                municipioId: 2,
                criterioId: 2,
                valor: 70,
                municipio: { id: 2, nome: 'Feira' },
                criterio: {
                    id: 2,
                    peso: 0.4,
                    tipo: 'custo'
                }
            }
        ];

        const resultado = prepararDadosTOPSIS(dados);

        expect(resultado.matriz).toEqual([
            [100, 50],
            [80, 70]
        ]);

        expect(resultado.pesos).toEqual([0.6, 0.4]);
        expect(resultado.tipos).toEqual(['beneficio', 'custo']);
        expect(resultado.municipios).toHaveLength(2);
    });

        test('deve rejeitar dados vazios', () => {
        expect(() => {
            prepararDadosTOPSIS([]);
        }).toThrow('Não existem dados na matriz de decisão');
    });

    test('deve rejeitar quando não houver critérios', () => {
        const dados = [];

        expect(() => {
            prepararDadosTOPSIS(dados);
        }).toThrow('Não existem dados na matriz de decisão');
    });

    test('deve rejeitar peso igual a zero', () => {
        const dados = [
            {
                municipioId: 1,
                criterioId: 1,
                valor: 100,
                municipio: { id: 1, nome: 'Salvador' },
                criterio: {
                    id: 1,
                    peso: 0,
                    tipo: 'beneficio'
                }
            }
        ];

        expect(() => {
            prepararDadosTOPSIS(dados);
        }).toThrow(
            'Todos os critérios devem possuir pesos maiores que zero'
        );
    });

    test('deve rejeitar quando a soma dos pesos não for 1', () => {
        const dados = [
            {
                municipioId: 1,
                criterioId: 1,
                valor: 100,
                municipio: { id: 1, nome: 'Salvador' },
                criterio: {
                    id: 1,
                    peso: 0.5,
                    tipo: 'beneficio'
                }
            },
            {
                municipioId: 1,
                criterioId: 2,
                valor: 50,
                municipio: { id: 1, nome: 'Salvador' },
                criterio: {
                    id: 2,
                    peso: 0.2,
                    tipo: 'custo'
                }
            }
        ];

        expect(() => {
            prepararDadosTOPSIS(dados);
        }).toThrow('A soma dos pesos deve ser 1');
    });

    test('deve rejeitar município sem valor para algum critério', () => {
        const dados = [
            {
                municipioId: 1,
                criterioId: 1,
                valor: 100,
                municipio: { id: 1, nome: 'Salvador' },
                criterio: {
                    id: 1,
                    peso: 0.5,
                    tipo: 'beneficio'
                }
            },
            {
                municipioId: 2,
                criterioId: 1,
                valor: 80,
                municipio: { id: 2, nome: 'Feira' },
                criterio: {
                    id: 1,
                    peso: 0.5,
                    tipo: 'beneficio'
                }
            },
            {
                municipioId: 1,
                criterioId: 2,
                valor: 50,
                municipio: { id: 1, nome: 'Salvador' },
                criterio: {
                    id: 2,
                    peso: 0.5,
                    tipo: 'custo'
                }
            }
        ];

        expect(() => {
            prepararDadosTOPSIS(dados);
        }).toThrow(
            'Município Feira não possui valor para o critério 2'
        );
    });

        test('deve retornar zero quando o denominador da normalização for zero', () => {
        const matriz = [
            [0],
            [0]
        ];

        const resultado = calcularTOPSIS(
            matriz,
            [1],
            ['beneficio']
        );

        expect(resultado.matrizNormalizada).toEqual([
            [0],
            [0]
        ]);
    });

    test('deve aceitar peso numérico válido convertido de string', () => {
        const dados = [
            {
                municipioId: 1,
                criterioId: 1,
                valor: 100,
                municipio: { id: 1, nome: 'Salvador' },
                criterio: {
                    id: 1,
                    peso: '0.5',
                    tipo: 'beneficio'
                }
            },
            {
                municipioId: 1,
                criterioId: 2,
                valor: 50,
                municipio: { id: 1, nome: 'Salvador' },
                criterio: {
                    id: 2,
                    peso: '0.5',
                    tipo: 'custo'
                }
            }
        ];

        const resultado = prepararDadosTOPSIS(dados);

        expect(resultado.pesos).toEqual([0.5, 0.5]);
    });

    test('deve retornar coeficiente zero quando as distâncias forem zero', () => {
        const matriz = [
            [10],
            [10]
        ];

        const resultado = calcularTOPSIS(
            matriz,
            [1],
            ['beneficio']
        );

        expect(resultado.coeficientes).toEqual([0, 0]);
    });

});