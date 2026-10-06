jest.mock('../src/services/municipio-coordenadas.service', () => ({
    atualizarCoordenadas: jest.fn(),
    listarComCoordenadas: jest.fn()
}));

const coordenadasService = require('../src/services/municipio-coordenadas.service');

const {
    atualizar,
    listar
} = require('../src/controllers/municipio-coordenadas.controller');

describe('Controller de coordenadas dos municípios', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('deve atualizar as coordenadas com sucesso', async () => {
        const req = {
            params: {
                id: '1'
            },
            body: {
                latitude: -12.9777,
                longitude: -38.5016
            }
        };

        const res = {
            json: jest.fn()
        };

        const next = jest.fn();

        const resultado = {
            message: 'Coordenadas atualizadas com sucesso'
        };

        coordenadasService.atualizarCoordenadas.mockResolvedValue(resultado);

        await atualizar(req, res, next);

        expect(coordenadasService.atualizarCoordenadas)
            .toHaveBeenCalledWith('1', -12.9777, -38.5016);

        expect(res.json).toHaveBeenCalledWith(resultado);
        expect(next).not.toHaveBeenCalled();
    });

    test('deve chamar next quando ocorrer erro ao atualizar coordenadas', async () => {
        const req = {
            params: {
                id: '1'
            },
            body: {
                latitude: -12.9777,
                longitude: -38.5016
            }
        };

        const res = {
            json: jest.fn()
        };

        const next = jest.fn();

        const erro = new Error('Erro ao atualizar coordenadas');

        coordenadasService.atualizarCoordenadas.mockRejectedValue(erro);

        await atualizar(req, res, next);

        expect(next).toHaveBeenCalledWith(erro);
        expect(res.json).not.toHaveBeenCalled();
    });

    test('deve listar municípios com coordenadas com sucesso', async () => {
        const req = {};

        const res = {
            json: jest.fn()
        };

        const next = jest.fn();

        const municipios = [
            {
                id: 1,
                nome: 'Salvador',
                uf: 'BA',
                latitude: -12.9777,
                longitude: -38.5016
            }
        ];

        coordenadasService.listarComCoordenadas
            .mockResolvedValue(municipios);

        await listar(req, res, next);

        expect(coordenadasService.listarComCoordenadas)
            .toHaveBeenCalled();

        expect(res.json).toHaveBeenCalledWith(municipios);
        expect(next).not.toHaveBeenCalled();
    });

    test('deve chamar next quando ocorrer erro ao listar municípios', async () => {
        const req = {};

        const res = {
            json: jest.fn()
        };

        const next = jest.fn();

        const erro = new Error('Erro ao listar municípios');

        coordenadasService.listarComCoordenadas
            .mockRejectedValue(erro);

        await listar(req, res, next);

        expect(next).toHaveBeenCalledWith(erro);
        expect(res.json).not.toHaveBeenCalled();
    });
});