jest.mock('../src/services/municipio.service', () => ({
    listarMunicipios: jest.fn(),
    buscarMunicipio: jest.fn(),
    criarMunicipio: jest.fn(),
    atualizarMunicipio: jest.fn(),
    removerMunicipio: jest.fn()
}));

jest.mock('../src/lib/prisma', () => ({
    $queryRaw: jest.fn()
}));

const municipioService = require('../src/services/municipio.service');
const prisma = require('../src/lib/prisma');

const {
    listar,
    buscarPorId,
    criar,
    atualizar,
    remover,
    listarComCoordenadas
} = require('../src/controllers/municipio.controller');

describe('Municipio Controller', () => {
    let req;
    let res;
    let next;

    beforeEach(() => {
        jest.clearAllMocks();

        req = {
            params: {},
            body: {}
        };

        res = {
            json: jest.fn(),
            status: jest.fn().mockReturnThis(),
            send: jest.fn()
        };

        next = jest.fn();
    });

    test('deve listar municípios', async () => {
        const municipios = [
            { id: 1, nome: 'Salvador', uf: 'BA' }
        ];

        municipioService.listarMunicipios.mockResolvedValue(municipios);

        await listar(req, res, next);

        expect(municipioService.listarMunicipios).toHaveBeenCalled();
        expect(res.json).toHaveBeenCalledWith(municipios);
        expect(next).not.toHaveBeenCalled();
    });

    test('deve buscar município por ID', async () => {
        req.params.id = '2';

        const municipio = {
            id: 2,
            nome: 'Salvador',
            uf: 'BA'
        };

        municipioService.buscarMunicipio.mockResolvedValue(municipio);

        await buscarPorId(req, res, next);

        expect(municipioService.buscarMunicipio).toHaveBeenCalledWith(2);
        expect(res.json).toHaveBeenCalledWith(municipio);
        expect(next).not.toHaveBeenCalled();
    });

    test('deve criar município', async () => {
        req.body = {
            nome: 'Feira de Santana',
            uf: 'BA',
            populacao: 616000
        };

        const municipio = {
            id: 3,
            ...req.body
        };

        municipioService.criarMunicipio.mockResolvedValue(municipio);

        await criar(req, res, next);

        expect(municipioService.criarMunicipio).toHaveBeenCalledWith(
            req.body
        );
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(municipio);
        expect(next).not.toHaveBeenCalled();
    });

    test('deve atualizar município', async () => {
        req.params.id = '3';
        req.body = {
            nome: 'Feira de Santana Atualizada'
        };

        const municipio = {
            id: 3,
            nome: 'Feira de Santana Atualizada'
        };

        municipioService.atualizarMunicipio.mockResolvedValue(municipio);

        await atualizar(req, res, next);

        expect(municipioService.atualizarMunicipio).toHaveBeenCalledWith(
            3,
            req.body
        );
        expect(res.json).toHaveBeenCalledWith(municipio);
        expect(next).not.toHaveBeenCalled();
    });

    test('deve remover município', async () => {
        req.params.id = '3';

        municipioService.removerMunicipio.mockResolvedValue();

        await remover(req, res, next);

        expect(municipioService.removerMunicipio).toHaveBeenCalledWith(3);
        expect(res.status).toHaveBeenCalledWith(204);
        expect(res.send).toHaveBeenCalled();
        expect(next).not.toHaveBeenCalled();
    });

    test('deve listar municípios com coordenadas', async () => {
        const municipios = [
            {
                id: 2,
                nome: 'Salvador',
                uf: 'BA',
                latitude: -12.9777,
                longitude: -38.5016
            }
        ];

        prisma.$queryRaw.mockResolvedValue(municipios);

        await listarComCoordenadas(req, res, next);

        expect(prisma.$queryRaw).toHaveBeenCalled();
        expect(res.json).toHaveBeenCalledWith(municipios);
        expect(next).not.toHaveBeenCalled();
    });

    test('deve encaminhar erro ao listar municípios', async () => {
        const erro = new Error('Erro ao listar');

        municipioService.listarMunicipios.mockRejectedValue(erro);

        await listar(req, res, next);

        expect(next).toHaveBeenCalledWith(erro);
    });

    test('deve encaminhar erro ao buscar município', async () => {
        const erro = new Error('Município não encontrado');

        req.params.id = '99';

        municipioService.buscarMunicipio.mockRejectedValue(erro);

        await buscarPorId(req, res, next);

        expect(next).toHaveBeenCalledWith(erro);
    });

    test('deve encaminhar erro ao criar município', async () => {
        const erro = new Error('Erro ao criar');

        municipioService.criarMunicipio.mockRejectedValue(erro);

        await criar(req, res, next);

        expect(next).toHaveBeenCalledWith(erro);
    });

    test('deve encaminhar erro ao atualizar município', async () => {
        const erro = new Error('Erro ao atualizar');

        req.params.id = '3';

        municipioService.atualizarMunicipio.mockRejectedValue(erro);

        await atualizar(req, res, next);

        expect(next).toHaveBeenCalledWith(erro);
    });

    test('deve encaminhar erro ao remover município', async () => {
        const erro = new Error('Erro ao remover');

        req.params.id = '3';

        municipioService.removerMunicipio.mockRejectedValue(erro);

        await remover(req, res, next);

        expect(next).toHaveBeenCalledWith(erro);
    });

    test('deve encaminhar erro ao listar municípios com coordenadas', async () => {
        const erro = new Error('Erro no banco');

        prisma.$queryRaw.mockRejectedValue(erro);

        await listarComCoordenadas(req, res, next);

        expect(next).toHaveBeenCalledWith(erro);
    });
});