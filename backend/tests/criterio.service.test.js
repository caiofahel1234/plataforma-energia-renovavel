jest.mock('../src/repositories/criterio.repository', () => ({
    listarTodos: jest.fn(),
    buscarPorId: jest.fn(),
    criar: jest.fn(),
    atualizar: jest.fn(),
    remover: jest.fn()
}));

const criterioRepository = require('../src/repositories/criterio.repository');

const {
    listarCriterios,
    buscarCriterio,
    criarCriterio,
    atualizarCriterio,
    removerCriterio,
    atualizarPesos
} = require('../src/services/criterio.service');

describe('Criterio Service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('deve listar critérios', async () => {
        const criterios = [
            { id: 1, nome: 'Renda per capita' }
        ];

        criterioRepository.listarTodos.mockResolvedValue(criterios);

        const resultado = await listarCriterios();

        expect(criterioRepository.listarTodos).toHaveBeenCalled();
        expect(resultado).toEqual(criterios);
    });

    test('deve buscar critério por ID', async () => {
        const criterio = {
            id: 1,
            nome: 'Renda per capita'
        };

        criterioRepository.buscarPorId.mockResolvedValue(criterio);

        const resultado = await buscarCriterio(1);

        expect(criterioRepository.buscarPorId).toHaveBeenCalledWith(1);
        expect(resultado).toEqual(criterio);
    });

    test('deve retornar erro 404 quando critério não existe', async () => {
        criterioRepository.buscarPorId.mockResolvedValue(null);

        await expect(buscarCriterio(99)).rejects.toMatchObject({
            message: 'Critério não encontrado',
            status: 404
        });
    });

    test('deve criar critério de benefício', async () => {
        const criterio = {
            id: 1,
            nome: 'Renda per capita',
            descricao: 'Renda média',
            tipo: 'beneficio',
            peso: 0.15,
            unidade: 'R$'
        };

        criterioRepository.criar.mockResolvedValue(criterio);

        const resultado = await criarCriterio({
            nome: 'Renda per capita',
            descricao: 'Renda média',
            tipo: 'BENEFICIO',
            peso: 0.15,
            unidade: 'R$'
        });

        expect(criterioRepository.criar).toHaveBeenCalledWith({
            nome: 'Renda per capita',
            descricao: 'Renda média',
            tipo: 'beneficio',
            peso: 0.15,
            unidade: 'R$'
        });

        expect(resultado).toEqual(criterio);
    });

    test('deve usar null para campos opcionais ao criar critério', async () => {
        const criterio = {
            id: 2,
            nome: 'Projetos',
            tipo: 'beneficio',
            descricao: null,
            peso: null,
            unidade: null
        };

        criterioRepository.criar.mockResolvedValue(criterio);

        await criarCriterio({
            nome: 'Projetos',
            tipo: 'beneficio'
        });

        expect(criterioRepository.criar).toHaveBeenCalledWith({
            nome: 'Projetos',
            descricao: null,
            tipo: 'beneficio',
            peso: null,
            unidade: null
        });
    });

    test('deve rejeitar criação sem nome', async () => {
        await expect(
            criarCriterio({
                tipo: 'beneficio'
            })
        ).rejects.toMatchObject({
            message: 'Nome e tipo são obrigatórios',
            status: 400
        });
    });

    test('deve rejeitar criação sem tipo', async () => {
        await expect(
            criarCriterio({
                nome: 'Renda'
            })
        ).rejects.toMatchObject({
            message: 'Nome e tipo são obrigatórios',
            status: 400
        });
    });

    test('deve rejeitar tipo inválido ao criar', async () => {
        await expect(
            criarCriterio({
                nome: 'Renda',
                tipo: 'invalido'
            })
        ).rejects.toMatchObject({
            message: 'Tipo deve ser beneficio ou custo',
            status: 400
        });
    });

    test('deve atualizar critério', async () => {
        const criterioAtual = {
            id: 1,
            nome: 'Renda'
        };

        const criterioAtualizado = {
            id: 1,
            nome: 'Renda per capita',
            tipo: 'beneficio'
        };

        criterioRepository.buscarPorId.mockResolvedValue(criterioAtual);
        criterioRepository.atualizar.mockResolvedValue(
            criterioAtualizado
        );

        const resultado = await atualizarCriterio(1, {
            nome: 'Renda per capita',
            descricao: 'Renda média',
            tipo: 'BENEFICIO',
            peso: 0.15,
            unidade: 'R$'
        });

        expect(criterioRepository.buscarPorId).toHaveBeenCalledWith(1);

        expect(criterioRepository.atualizar).toHaveBeenCalledWith(1, {
            nome: 'Renda per capita',
            descricao: 'Renda média',
            tipo: 'beneficio',
            peso: 0.15,
            unidade: 'R$'
        });

        expect(resultado).toEqual(criterioAtualizado);
    });

    test('deve rejeitar tipo inválido ao atualizar', async () => {
        criterioRepository.buscarPorId.mockResolvedValue({
            id: 1,
            nome: 'Renda'
        });

        await expect(
            atualizarCriterio(1, {
                tipo: 'invalido'
            })
        ).rejects.toMatchObject({
            message: 'Tipo deve ser beneficio ou custo',
            status: 400
        });

        expect(criterioRepository.atualizar).not.toHaveBeenCalled();
    });

    test('deve remover critério', async () => {
        const criterio = {
            id: 1,
            nome: 'Renda'
        };

        criterioRepository.buscarPorId.mockResolvedValue(criterio);
        criterioRepository.remover.mockResolvedValue(criterio);

        const resultado = await removerCriterio(1);

        expect(criterioRepository.buscarPorId).toHaveBeenCalledWith(1);
        expect(criterioRepository.remover).toHaveBeenCalledWith(1);
        expect(resultado).toEqual(criterio);
    });

    test('deve rejeitar lista de pesos vazia', async () => {
        await expect(
            atualizarPesos([])
        ).rejects.toMatchObject({
            message: 'A lista de pesos deve ser informada',
            status: 400
        });
    });

    test('deve rejeitar pesos que não são um array', async () => {
        await expect(
            atualizarPesos(null)
        ).rejects.toMatchObject({
            message: 'A lista de pesos deve ser informada',
            status: 400
        });
    });

    test('deve rejeitar peso zero', async () => {
        await expect(
            atualizarPesos([
                {
                    criterioId: 1,
                    peso: 0
                }
            ])
        ).rejects.toMatchObject({
            message: 'Todos os critérios devem possuir pesos maiores que zero',
            status: 400
        });
    });

    test('deve rejeitar criterioId inválido', async () => {
        await expect(
            atualizarPesos([
                {
                    criterioId: 'abc',
                    peso: 1
                }
            ])
        ).rejects.toMatchObject({
            message: 'Todos os critérios devem possuir pesos maiores que zero',
            status: 400
        });
    });

    test('deve rejeitar peso não numérico', async () => {
        await expect(
            atualizarPesos([
                {
                    criterioId: 1,
                    peso: 'abc'
                }
            ])
        ).rejects.toMatchObject({
            message: 'Todos os critérios devem possuir pesos maiores que zero',
            status: 400
        });
    });

    test('deve rejeitar soma de pesos diferente de 1', async () => {
        await expect(
            atualizarPesos([
                {
                    criterioId: 1,
                    peso: 0.4
                },
                {
                    criterioId: 2,
                    peso: 0.4
                }
            ])
        ).rejects.toMatchObject({
            message: 'A soma dos pesos deve ser 1. Soma atual: 0.8000',
            status: 400
        });
    });

    test('deve rejeitar quando um critério dos pesos não existe', async () => {
        criterioRepository.buscarPorId.mockResolvedValue(null);

        await expect(
            atualizarPesos([
                {
                    criterioId: 99,
                    peso: 1
                }
            ])
        ).rejects.toMatchObject({
            message: 'Critério não encontrado',
            status: 404
        });
    });

    test('deve atualizar os pesos dos critérios', async () => {
        const pesos = [
            {
                criterioId: 1,
                peso: 0.4
            },
            {
                criterioId: 2,
                peso: 0.6
            }
        ];

        criterioRepository.buscarPorId.mockResolvedValue({
            id: 1,
            nome: 'Critério'
        });

        criterioRepository.atualizar
            .mockResolvedValueOnce({
                id: 1,
                peso: 0.4
            })
            .mockResolvedValueOnce({
                id: 2,
                peso: 0.6
            });

        const resultado = await atualizarPesos(pesos);

        expect(criterioRepository.buscarPorId).toHaveBeenCalledTimes(2);

        expect(criterioRepository.buscarPorId)
            .toHaveBeenNthCalledWith(1, 1);

        expect(criterioRepository.buscarPorId)
            .toHaveBeenNthCalledWith(2, 2);

        expect(criterioRepository.atualizar).toHaveBeenCalledTimes(2);

        expect(criterioRepository.atualizar)
            .toHaveBeenNthCalledWith(1, 1, {
                peso: 0.4
            });

        expect(criterioRepository.atualizar)
            .toHaveBeenNthCalledWith(2, 2, {
                peso: 0.6
            });

        expect(resultado).toEqual([
            {
                id: 1,
                peso: 0.4
            },
            {
                id: 2,
                peso: 0.6
            }
        ]);
    });
});