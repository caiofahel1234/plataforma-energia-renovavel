jest.mock('../src/lib/prisma', () => ({
    matrizDecisao: {
        findMany: jest.fn()
    },
    simulacao: {
        create: jest.fn()
    },
    resultadoRanking: {
        createMany: jest.fn()
    }
}));

const prisma = require('../src/lib/prisma');

const {
    executarTOPSIS
} = require('../src/services/topsis/topsis-execucao.service');

describe('Serviço de execução do TOPSIS', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('deve rejeitar quando não existem dados na matriz', async () => {
        prisma.matrizDecisao.findMany.mockResolvedValue([]);

        await expect(
            executarTOPSIS(1)
        ).rejects.toThrow(
            'Não existem dados para executar o TOPSIS'
        );

        expect(prisma.simulacao.create).not.toHaveBeenCalled();
        expect(prisma.resultadoRanking.createMany).not.toHaveBeenCalled();
    });

    test('deve executar TOPSIS e salvar a simulação e o ranking', async () => {
        const dados = [
            {
                municipioId: 1,
                criterioId: 1,
                valor: 100,
                municipio: {
                    id: 1,
                    nome: 'Salvador'
                },
                criterio: {
                    id: 1,
                    nome: 'Renda',
                    peso: 0.5,
                    tipo: 'beneficio'
                }
            },
            {
                municipioId: 1,
                criterioId: 2,
                valor: 50,
                municipio: {
                    id: 1,
                    nome: 'Salvador'
                },
                criterio: {
                    id: 2,
                    nome: 'Tarifa',
                    peso: 0.5,
                    tipo: 'custo'
                }
            },
            {
                municipioId: 2,
                criterioId: 1,
                valor: 80,
                municipio: {
                    id: 2,
                    nome: 'Feira de Santana'
                },
                criterio: {
                    id: 1,
                    nome: 'Renda',
                    peso: 0.5,
                    tipo: 'beneficio'
                }
            },
            {
                municipioId: 2,
                criterioId: 2,
                valor: 70,
                municipio: {
                    id: 2,
                    nome: 'Feira de Santana'
                },
                criterio: {
                    id: 2,
                    nome: 'Tarifa',
                    peso: 0.5,
                    tipo: 'custo'
                }
            }
        ];

        prisma.matrizDecisao.findMany.mockResolvedValue(dados);

        prisma.simulacao.create.mockResolvedValue({
            id: 10,
            usuarioId: 1,
            status: 'concluida'
        });

        prisma.resultadoRanking.createMany.mockResolvedValue({
            count: 2
        });

        const resultado = await executarTOPSIS(1);

        expect(resultado.simulacao.id).toBe(10);

        expect(resultado.ranking).toHaveLength(2);

        expect(resultado.ranking[0].posicao).toBe(1);
        expect(resultado.ranking[1].posicao).toBe(2);

        expect(prisma.simulacao.create).toHaveBeenCalledTimes(1);

        expect(prisma.resultadoRanking.createMany).toHaveBeenCalledTimes(1);

        expect(
            prisma.resultadoRanking.createMany.mock.calls[0][0].data
        ).toHaveLength(2);
    });

});