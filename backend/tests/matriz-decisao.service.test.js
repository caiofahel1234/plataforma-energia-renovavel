jest.mock('../src/repositories/matriz-decisao.repository', () => ({
    listarTodos: jest.fn(),
    buscarPorId: jest.fn(),
    criar: jest.fn(),
    atualizar: jest.fn(),
    remover: jest.fn(),
    criarEmLote: jest.fn()
}));

jest.mock('../src/repositories/municipio.repository', () => ({
    buscarPorId: jest.fn()
}));

jest.mock('../src/repositories/criterio.repository', () => ({
    buscarPorId: jest.fn()
}));

const matrizDecisaoRepository = require('../src/repositories/matriz-decisao.repository');
const municipioRepository = require('../src/repositories/municipio.repository');
const criterioRepository = require('../src/repositories/criterio.repository');

const {
    listarMatriz,
    buscarMatriz,
    criarMatriz,
    atualizarMatriz,
    removerMatriz,
    importarMatriz
} = require('../src/services/matriz-decisao.service');

describe('Matriz Decisão Service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('deve listar matriz de decisão', async () => {
        const registros = [
            {
                id: 1,
                municipioId: 1,
                criterioId: 1,
                valor: 10
            }
        ];

        matrizDecisaoRepository.listarTodos.mockResolvedValue(registros);

        const resultado = await listarMatriz();

        expect(matrizDecisaoRepository.listarTodos).toHaveBeenCalled();
        expect(resultado).toEqual(registros);
    });

    test('deve buscar registro da matriz por ID', async () => {
        const registro = {
            id: 1,
            municipioId: 1,
            criterioId: 1,
            valor: 10
        };

        matrizDecisaoRepository.buscarPorId.mockResolvedValue(registro);

        const resultado = await buscarMatriz(1);

        expect(matrizDecisaoRepository.buscarPorId).toHaveBeenCalledWith(1);
        expect(resultado).toEqual(registro);
    });

    test('deve retornar erro 404 quando registro não existe', async () => {
        matrizDecisaoRepository.buscarPorId.mockResolvedValue(null);

        await expect(
            buscarMatriz(99)
        ).rejects.toMatchObject({
            message: 'Registro da matriz de decisão não encontrado',
            status: 404
        });
    });

    test('deve criar registro da matriz', async () => {
        const municipio = {
            id: 1,
            nome: 'Salvador'
        };

        const criterio = {
            id: 1,
            nome: 'Renda per capita'
        };

        const registro = {
            id: 1,
            municipioId: 1,
            criterioId: 1,
            valor: 2500,
            anoReferencia: 2025
        };

        municipioRepository.buscarPorId.mockResolvedValue(municipio);
        criterioRepository.buscarPorId.mockResolvedValue(criterio);
        matrizDecisaoRepository.criar.mockResolvedValue(registro);

        const resultado = await criarMatriz({
            municipioId: '1',
            criterioId: '1',
            valor: '2500',
            anoReferencia: '2025'
        });

        expect(municipioRepository.buscarPorId).toHaveBeenCalledWith(1);
        expect(criterioRepository.buscarPorId).toHaveBeenCalledWith(1);

        expect(matrizDecisaoRepository.criar).toHaveBeenCalledWith({
            municipioId: 1,
            criterioId: 1,
            valor: 2500,
            anoReferencia: 2025
        });

        expect(resultado).toEqual(registro);
    });

    test('deve criar registro sem ano de referência usando null', async () => {
        municipioRepository.buscarPorId.mockResolvedValue({
            id: 1
        });

        criterioRepository.buscarPorId.mockResolvedValue({
            id: 1
        });

        matrizDecisaoRepository.criar.mockResolvedValue({
            id: 1
        });

        await criarMatriz({
            municipioId: 1,
            criterioId: 1,
            valor: 100
        });

        expect(matrizDecisaoRepository.criar).toHaveBeenCalledWith({
            municipioId: 1,
            criterioId: 1,
            valor: 100,
            anoReferencia: null
        });
    });

    test('deve rejeitar criação sem município', async () => {
        await expect(
            criarMatriz({
                criterioId: 1,
                valor: 100
            })
        ).rejects.toMatchObject({
            message: 'Município, critério e valor são obrigatórios',
            status: 400
        });
    });

    test('deve rejeitar criação sem critério', async () => {
        await expect(
            criarMatriz({
                municipioId: 1,
                valor: 100
            })
        ).rejects.toMatchObject({
            message: 'Município, critério e valor são obrigatórios',
            status: 400
        });
    });

    test('deve rejeitar criação sem valor', async () => {
        await expect(
            criarMatriz({
                municipioId: 1,
                criterioId: 1
            })
        ).rejects.toMatchObject({
            message: 'Município, critério e valor são obrigatórios',
            status: 400
        });
    });

    test('deve rejeitar município inexistente ao criar', async () => {
        municipioRepository.buscarPorId.mockResolvedValue(null);

        await expect(
            criarMatriz({
                municipioId: 99,
                criterioId: 1,
                valor: 100
            })
        ).rejects.toMatchObject({
            message: 'Município não encontrado',
            status: 404
        });
    });

    test('deve rejeitar critério inexistente ao criar', async () => {
        municipioRepository.buscarPorId.mockResolvedValue({
            id: 1
        });

        criterioRepository.buscarPorId.mockResolvedValue(null);

        await expect(
            criarMatriz({
                municipioId: 1,
                criterioId: 99,
                valor: 100
            })
        ).rejects.toMatchObject({
            message: 'Critério não encontrado',
            status: 404
        });
    });

    test('deve rejeitar valor não numérico ao criar', async () => {
        municipioRepository.buscarPorId.mockResolvedValue({
            id: 1
        });

        criterioRepository.buscarPorId.mockResolvedValue({
            id: 1
        });

        await expect(
            criarMatriz({
                municipioId: 1,
                criterioId: 1,
                valor: 'abc'
            })
        ).rejects.toMatchObject({
            message: 'Valor deve ser numérico',
            status: 400
        });
    });

    test('deve atualizar valor da matriz', async () => {
        matrizDecisaoRepository.buscarPorId.mockResolvedValue({
            id: 1
        });

        matrizDecisaoRepository.atualizar.mockResolvedValue({
            id: 1,
            valor: 500
        });

        const resultado = await atualizarMatriz(1, {
            valor: '500'
        });

        expect(matrizDecisaoRepository.buscarPorId).toHaveBeenCalledWith(1);

        expect(matrizDecisaoRepository.atualizar).toHaveBeenCalledWith(
            1,
            {
                valor: 500
            }
        );

        expect(resultado).toEqual({
            id: 1,
            valor: 500
        });
    });

    test('deve atualizar ano de referência', async () => {
        matrizDecisaoRepository.buscarPorId.mockResolvedValue({
            id: 1
        });

        matrizDecisaoRepository.atualizar.mockResolvedValue({
            id: 1,
            anoReferencia: 2026
        });

        await atualizarMatriz(1, {
            anoReferencia: '2026'
        });

        expect(matrizDecisaoRepository.atualizar).toHaveBeenCalledWith(
            1,
            {
                anoReferencia: 2026
            }
        );
    });

    test('deve atualizar ano de referência para null quando vazio', async () => {
        matrizDecisaoRepository.buscarPorId.mockResolvedValue({
            id: 1
        });

        matrizDecisaoRepository.atualizar.mockResolvedValue({
            id: 1,
            anoReferencia: null
        });

        await atualizarMatriz(1, {
            anoReferencia: null
        });

        expect(matrizDecisaoRepository.atualizar).toHaveBeenCalledWith(
            1,
            {
                anoReferencia: null
            }
        );
    });

    test('deve permitir atualização sem valor e sem ano', async () => {
        matrizDecisaoRepository.buscarPorId.mockResolvedValue({
            id: 1
        });

        matrizDecisaoRepository.atualizar.mockResolvedValue({
            id: 1
        });

        await atualizarMatriz(1, {});

        expect(matrizDecisaoRepository.atualizar).toHaveBeenCalledWith(
            1,
            {}
        );
    });

    test('deve rejeitar atualização com valor não numérico', async () => {
        matrizDecisaoRepository.buscarPorId.mockResolvedValue({
            id: 1
        });

        await expect(
            atualizarMatriz(1, {
                valor: 'abc'
            })
        ).rejects.toMatchObject({
            message: 'Valor deve ser numérico',
            status: 400
        });

        expect(matrizDecisaoRepository.atualizar).not.toHaveBeenCalled();
    });

    test('deve remover registro da matriz', async () => {
        const registro = {
            id: 1,
            municipioId: 1,
            criterioId: 1
        };

        matrizDecisaoRepository.buscarPorId.mockResolvedValue(registro);
        matrizDecisaoRepository.remover.mockResolvedValue(registro);

        const resultado = await removerMatriz(1);

        expect(matrizDecisaoRepository.buscarPorId).toHaveBeenCalledWith(1);
        expect(matrizDecisaoRepository.remover).toHaveBeenCalledWith(1);
        expect(resultado).toEqual(registro);
    });

    test('deve rejeitar importação vazia', async () => {
        await expect(
            importarMatriz([])
        ).rejects.toMatchObject({
            message: 'A lista de dados para importação deve ser informada',
            status: 400
        });
    });

    test('deve rejeitar importação que não seja array', async () => {
        await expect(
            importarMatriz(null)
        ).rejects.toMatchObject({
            message: 'A lista de dados para importação deve ser informada',
            status: 400
        });
    });

    test('deve rejeitar registro de importação sem dados obrigatórios', async () => {
        await expect(
            importarMatriz([
                {
                    municipioId: 1,
                    criterioId: 1
                }
            ])
        ).rejects.toMatchObject({
            message: 'Cada registro deve possuir municipioId, criterioId e valor',
            status: 400
        });
    });

    test('deve rejeitar município inexistente na importação', async () => {
        municipioRepository.buscarPorId.mockResolvedValue(null);

        await expect(
            importarMatriz([
                {
                    municipioId: 99,
                    criterioId: 1,
                    valor: 100
                }
            ])
        ).rejects.toMatchObject({
            message: 'Município 99 não encontrado',
            status: 404
        });
    });

    test('deve rejeitar critério inexistente na importação', async () => {
        municipioRepository.buscarPorId.mockResolvedValue({
            id: 1
        });

        criterioRepository.buscarPorId.mockResolvedValue(null);

        await expect(
            importarMatriz([
                {
                    municipioId: 1,
                    criterioId: 99,
                    valor: 100
                }
            ])
        ).rejects.toMatchObject({
            message: 'Critério 99 não encontrado',
            status: 404
        });
    });

    test('deve rejeitar valor não numérico na importação', async () => {
        municipioRepository.buscarPorId.mockResolvedValue({
            id: 1
        });

        criterioRepository.buscarPorId.mockResolvedValue({
            id: 1
        });

        await expect(
            importarMatriz([
                {
                    municipioId: 1,
                    criterioId: 1,
                    valor: 'abc'
                }
            ])
        ).rejects.toMatchObject({
            message: 'Todos os valores devem ser numéricos',
            status: 400
        });
    });

    test('deve importar matriz em lote', async () => {
        municipioRepository.buscarPorId.mockResolvedValue({
            id: 1
        });

        criterioRepository.buscarPorId.mockResolvedValue({
            id: 1
        });

        const resultadoEsperado = {
            count: 2
        };

        matrizDecisaoRepository.criarEmLote.mockResolvedValue(
            resultadoEsperado
        );

        const resultado = await importarMatriz([
            {
                municipioId: '1',
                criterioId: '1',
                valor: '100',
                anoReferencia: '2025'
            },
            {
                municipioId: '2',
                criterioId: '2',
                valor: '200'
            }
        ]);

        expect(municipioRepository.buscarPorId).toHaveBeenCalledTimes(2);
        expect(criterioRepository.buscarPorId).toHaveBeenCalledTimes(2);

        expect(matrizDecisaoRepository.criarEmLote).toHaveBeenCalledWith([
            {
                municipioId: 1,
                criterioId: 1,
                valor: 100,
                anoReferencia: 2025
            },
            {
                municipioId: 2,
                criterioId: 2,
                valor: 200,
                anoReferencia: null
            }
        ]);

        expect(resultado).toEqual(resultadoEsperado);
    });
});