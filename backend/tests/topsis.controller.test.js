jest.mock('../src/services/topsis/topsis-execucao.service', () => ({
    executarTOPSIS: jest.fn()
}));

const { executarTOPSIS } = require('../src/services/topsis/topsis-execucao.service');

const {
    executar
} = require('../src/controllers/topsis.controller');

describe('Controller do TOPSIS', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('deve executar o TOPSIS com sucesso', async () => {
        const req = {
            usuario: {
                id: 1
            }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        const next = jest.fn();

        const resultado = {
            simulacaoId: 10,
            ranking: [
                {
                    municipioId: 1,
                    coeficienteCi: 0.85,
                    posicao: 1
                }
            ]
        };

        executarTOPSIS.mockResolvedValue(resultado);

        await executar(req, res, next);

        expect(executarTOPSIS)
            .toHaveBeenCalledWith(1);

        expect(res.status)
            .toHaveBeenCalledWith(201);

        expect(res.json)
            .toHaveBeenCalledWith(resultado);

        expect(next)
            .not.toHaveBeenCalled();
    });

    test('deve chamar next quando ocorrer erro ao executar o TOPSIS', async () => {
        const req = {
            usuario: {
                id: 1
            }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        const next = jest.fn();

        const erro = new Error('Erro ao executar TOPSIS');

        executarTOPSIS.mockRejectedValue(erro);

        await executar(req, res, next);

        expect(executarTOPSIS)
            .toHaveBeenCalledWith(1);

        expect(next)
            .toHaveBeenCalledWith(erro);

        expect(res.status)
            .not.toHaveBeenCalled();

        expect(res.json)
            .not.toHaveBeenCalled();
    });
});