jest.mock('../src/services/criterio.service', () => ({
    listarCriterios: jest.fn(),
    buscarCriterio: jest.fn(),
    criarCriterio: jest.fn(),
    atualizarCriterio: jest.fn(),
    removerCriterio: jest.fn(),
    atualizarPesos: jest.fn()
}));

const criterioService = require('../src/services/criterio.service');

const {
    listar,
    buscarPorId,
    criar,
    atualizar,
    remover,
    atualizarPesos
} = require('../src/controllers/criterio.controller');

describe('Controller de critérios', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('listar deve retornar os critérios', async () => {
        const criterios = [
            { id: 1, nome: 'Renda', tipo: 'beneficio' }
        ];

        criterioService.listarCriterios.mockResolvedValue(criterios);

        const req = {};
        const res = {
            json: jest.fn()
        };
        const next = jest.fn();

        await listar(req, res, next);

        expect(criterioService.listarCriterios).toHaveBeenCalled();
        expect(res.json).toHaveBeenCalledWith(criterios);
        expect(next).not.toHaveBeenCalled();
    });

    test('listar deve chamar next quando ocorrer erro', async () => {
        const erro = new Error('Erro ao listar');

        criterioService.listarCriterios.mockRejectedValue(erro);

        const req = {};
        const res = {
            json: jest.fn()
        };
        const next = jest.fn();

        await listar(req, res, next);

        expect(next).toHaveBeenCalledWith(erro);
    });

    test('buscarPorId deve retornar o critério', async () => {
        const criterio = {
            id: 1,
            nome: 'Renda',
            tipo: 'beneficio'
        };

        criterioService.buscarCriterio.mockResolvedValue(criterio);

        const req = {
            params: {
                id: '1'
            }
        };

        const res = {
            json: jest.fn()
        };

        const next = jest.fn();

        await buscarPorId(req, res, next);

        expect(criterioService.buscarCriterio).toHaveBeenCalledWith(1);
        expect(res.json).toHaveBeenCalledWith(criterio);
        expect(next).not.toHaveBeenCalled();
    });

    test('buscarPorId deve chamar next quando ocorrer erro', async () => {
        const erro = new Error('Critério não encontrado');

        criterioService.buscarCriterio.mockRejectedValue(erro);

        const req = {
            params: {
                id: '999'
            }
        };

        const res = {
            json: jest.fn()
        };

        const next = jest.fn();

        await buscarPorId(req, res, next);

        expect(next).toHaveBeenCalledWith(erro);
    });

    test('criar deve retornar o critério criado com status 201', async () => {
        const dados = {
            nome: 'Irradiação solar',
            tipo: 'beneficio',
            peso: 0.2
        };

        const criterio = {
            id: 2,
            ...dados
        };

        criterioService.criarCriterio.mockResolvedValue(criterio);

        const req = {
            body: dados
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        const next = jest.fn();

        await criar(req, res, next);

        expect(criterioService.criarCriterio).toHaveBeenCalledWith(dados);
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(criterio);
        expect(next).not.toHaveBeenCalled();
    });

    test('criar deve chamar next quando ocorrer erro', async () => {
        const erro = new Error('Dados inválidos');

        criterioService.criarCriterio.mockRejectedValue(erro);

        const req = {
            body: {}
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        const next = jest.fn();

        await criar(req, res, next);

        expect(next).toHaveBeenCalledWith(erro);
    });

    test('atualizar deve retornar o critério atualizado', async () => {
        const dados = {
            nome: 'Nova renda',
            peso: 0.3
        };

        const criterio = {
            id: 1,
            ...dados
        };

        criterioService.atualizarCriterio.mockResolvedValue(criterio);

        const req = {
            params: {
                id: '1'
            },
            body: dados
        };

        const res = {
            json: jest.fn()
        };

        const next = jest.fn();

        await atualizar(req, res, next);

        expect(criterioService.atualizarCriterio).toHaveBeenCalledWith(
            1,
            dados
        );

        expect(res.json).toHaveBeenCalledWith(criterio);
        expect(next).not.toHaveBeenCalled();
    });

    test('atualizar deve chamar next quando ocorrer erro', async () => {
        const erro = new Error('Erro ao atualizar');

        criterioService.atualizarCriterio.mockRejectedValue(erro);

        const req = {
            params: {
                id: '1'
            },
            body: {}
        };

        const res = {
            json: jest.fn()
        };

        const next = jest.fn();

        await atualizar(req, res, next);

        expect(next).toHaveBeenCalledWith(erro);
    });

    test('remover deve retornar status 204', async () => {
        criterioService.removerCriterio.mockResolvedValue();

        const req = {
            params: {
                id: '1'
            }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn()
        };

        const next = jest.fn();

        await remover(req, res, next);

        expect(criterioService.removerCriterio).toHaveBeenCalledWith(1);
        expect(res.status).toHaveBeenCalledWith(204);
        expect(res.send).toHaveBeenCalled();
        expect(next).not.toHaveBeenCalled();
    });

    test('remover deve chamar next quando ocorrer erro', async () => {
        const erro = new Error('Erro ao remover');

        criterioService.removerCriterio.mockRejectedValue(erro);

        const req = {
            params: {
                id: '1'
            }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn()
        };

        const next = jest.fn();

        await remover(req, res, next);

        expect(next).toHaveBeenCalledWith(erro);
    });

    test('atualizarPesos deve retornar os critérios atualizados', async () => {
        const pesos = [
            { criterioId: 1, peso: 0.5 },
            { criterioId: 2, peso: 0.5 }
        ];

        const resultado = [
            { id: 1, peso: 0.5 },
            { id: 2, peso: 0.5 }
        ];

        criterioService.atualizarPesos.mockResolvedValue(resultado);

        const req = {
            body: {
                pesos
            }
        };

        const res = {
            json: jest.fn()
        };

        const next = jest.fn();

        await atualizarPesos(req, res, next);

        expect(criterioService.atualizarPesos).toHaveBeenCalledWith(pesos);
        expect(res.json).toHaveBeenCalledWith(resultado);
        expect(next).not.toHaveBeenCalled();
    });

    test('atualizarPesos deve chamar next quando ocorrer erro', async () => {
        const erro = new Error('Pesos inválidos');

        criterioService.atualizarPesos.mockRejectedValue(erro);

        const req = {
            body: {
                pesos: []
            }
        };

        const res = {
            json: jest.fn()
        };

        const next = jest.fn();

        await atualizarPesos(req, res, next);

        expect(next).toHaveBeenCalledWith(erro);
    });

});