jest.mock('../src/services/matriz-decisao.service', () => ({
    listarMatriz: jest.fn(),
    buscarMatriz: jest.fn(),
    criarMatriz: jest.fn(),
    atualizarMatriz: jest.fn(),
    removerMatriz: jest.fn(),
    importarMatriz: jest.fn()
}));

const matrizDecisaoService =
    require('../src/services/matriz-decisao.service');

const {
    listar,
    buscarPorId,
    criar,
    atualizar,
    remover,
    importar
} = require('../src/controllers/matriz-decisao.controller');

describe('Controller da matriz de decisão', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('listar deve retornar a matriz', async () => {
        const matriz = [
            {
                id: 1,
                municipioId: 2,
                criterioId: 1,
                valor: 10
            }
        ];

        matrizDecisaoService.listarMatriz.mockResolvedValue(matriz);

        const req = {};
        const res = {
            json: jest.fn()
        };
        const next = jest.fn();

        await listar(req, res, next);

        expect(matrizDecisaoService.listarMatriz).toHaveBeenCalled();
        expect(res.json).toHaveBeenCalledWith(matriz);
        expect(next).not.toHaveBeenCalled();
    });

    test('listar deve chamar next quando ocorrer erro', async () => {
        const erro = new Error('Erro ao listar');

        matrizDecisaoService.listarMatriz.mockRejectedValue(erro);

        const req = {};
        const res = {
            json: jest.fn()
        };
        const next = jest.fn();

        await listar(req, res, next);

        expect(next).toHaveBeenCalledWith(erro);
    });

    test('buscarPorId deve retornar o registro', async () => {
        const registro = {
            id: 1,
            municipioId: 2,
            criterioId: 1,
            valor: 10
        };

        matrizDecisaoService.buscarMatriz.mockResolvedValue(registro);

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

        expect(matrizDecisaoService.buscarMatriz).toHaveBeenCalledWith(1);
        expect(res.json).toHaveBeenCalledWith(registro);
        expect(next).not.toHaveBeenCalled();
    });

    test('buscarPorId deve chamar next quando ocorrer erro', async () => {
        const erro = new Error('Registro não encontrado');

        matrizDecisaoService.buscarMatriz.mockRejectedValue(erro);

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

    test('criar deve retornar o registro criado com status 201', async () => {
        const dados = {
            municipioId: 2,
            criterioId: 1,
            valor: 15
        };

        const registro = {
            id: 1,
            ...dados
        };

        matrizDecisaoService.criarMatriz.mockResolvedValue(registro);

        const req = {
            body: dados
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        const next = jest.fn();

        await criar(req, res, next);

        expect(
            matrizDecisaoService.criarMatriz
        ).toHaveBeenCalledWith(dados);

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(registro);
        expect(next).not.toHaveBeenCalled();
    });

    test('criar deve chamar next quando ocorrer erro', async () => {
        const erro = new Error('Dados inválidos');

        matrizDecisaoService.criarMatriz.mockRejectedValue(erro);

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

    test('atualizar deve retornar o registro atualizado', async () => {
        const dados = {
            valor: 20
        };

        const registro = {
            id: 1,
            municipioId: 2,
            criterioId: 1,
            valor: 20
        };

        matrizDecisaoService.atualizarMatriz.mockResolvedValue(registro);

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

        expect(
            matrizDecisaoService.atualizarMatriz
        ).toHaveBeenCalledWith(1, dados);

        expect(res.json).toHaveBeenCalledWith(registro);
        expect(next).not.toHaveBeenCalled();
    });

    test('atualizar deve chamar next quando ocorrer erro', async () => {
        const erro = new Error('Erro ao atualizar');

        matrizDecisaoService.atualizarMatriz.mockRejectedValue(erro);

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
        matrizDecisaoService.removerMatriz.mockResolvedValue();

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

        expect(
            matrizDecisaoService.removerMatriz
        ).toHaveBeenCalledWith(1);

        expect(res.status).toHaveBeenCalledWith(204);
        expect(res.send).toHaveBeenCalled();
        expect(next).not.toHaveBeenCalled();
    });

    test('remover deve chamar next quando ocorrer erro', async () => {
        const erro = new Error('Erro ao remover');

        matrizDecisaoService.removerMatriz.mockRejectedValue(erro);

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

    test('importar deve retornar mensagem e quantidade importada', async () => {
        const dados = [
            {
                municipioId: 2,
                criterioId: 1,
                valor: 10
            },
            {
                municipioId: 3,
                criterioId: 2,
                valor: 20
            }
        ];

        matrizDecisaoService.importarMatriz.mockResolvedValue({
            count: 2
        });

        const req = {
            body: {
                dados
            }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        const next = jest.fn();

        await importar(req, res, next);

        expect(
            matrizDecisaoService.importarMatriz
        ).toHaveBeenCalledWith(dados);

        expect(res.status).toHaveBeenCalledWith(201);

        expect(res.json).toHaveBeenCalledWith({
            message: 'Dados importados com sucesso',
            quantidade: 2
        });

        expect(next).not.toHaveBeenCalled();
    });

    test('importar deve chamar next quando ocorrer erro', async () => {
        const erro = new Error('Erro na importação');

        matrizDecisaoService.importarMatriz.mockRejectedValue(erro);

        const req = {
            body: {
                dados: []
            }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        const next = jest.fn();

        await importar(req, res, next);

        expect(next).toHaveBeenCalledWith(erro);
    });

});