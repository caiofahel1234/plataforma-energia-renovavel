jest.mock('../src/lib/prisma', () => ({
    simulacao: {
        findUnique: jest.fn()
    }
}));

const prisma = require('../src/lib/prisma');

const {
    buscarPorId
} = require('../src/controllers/simulacao.controller');

describe('Controller de simulação', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('deve retornar 400 quando o ID da simulação for inválido', async () => {
        const req = {
            params: {
                id: 'abc'
            }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        const next = jest.fn();

        await buscarPorId(req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);

        expect(res.json).toHaveBeenCalledWith({
            error: 'ID da simulação inválido'
        });

        expect(prisma.simulacao.findUnique).not.toHaveBeenCalled();

        expect(next).not.toHaveBeenCalled();
    });

    test('deve retornar 404 quando a simulação não for encontrada', async () => {
        const req = {
            params: {
                id: '10'
            }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        const next = jest.fn();

        prisma.simulacao.findUnique.mockResolvedValue(null);

        await buscarPorId(req, res, next);

        expect(prisma.simulacao.findUnique).toHaveBeenCalledWith({
            where: {
                id: 10
            },
            include: {
                usuario: {
                    select: {
                        id: true,
                        nome: true,
                        email: true,
                        perfil: true
                    }
                },
                resultados: {
                    orderBy: {
                        posicao: 'asc'
                    },
                    include: {
                        municipio: true
                    }
                }
            }
        });

        expect(res.status).toHaveBeenCalledWith(404);

        expect(res.json).toHaveBeenCalledWith({
            error: 'Simulação não encontrada'
        });

        expect(next).not.toHaveBeenCalled();
    });

    test('deve retornar a simulação encontrada', async () => {
        const req = {
            params: {
                id: '10'
            }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        const next = jest.fn();

        const simulacao = {
            id: 10,
            usuarioId: 1,
            status: 'concluida',
            usuario: {
                id: 1,
                nome: 'Caio',
                email: 'caio@teste.com',
                perfil: 'admin'
            },
            resultados: [
                {
                    id: 1,
                    posicao: 1,
                    municipio: {
                        id: 2,
                        nome: 'Salvador',
                        uf: 'BA'
                    }
                }
            ]
        };

        prisma.simulacao.findUnique.mockResolvedValue(simulacao);

        await buscarPorId(req, res, next);

        expect(prisma.simulacao.findUnique).toHaveBeenCalled();

        expect(res.json).toHaveBeenCalledWith(simulacao);

        expect(next).not.toHaveBeenCalled();
    });

    test('deve chamar next quando ocorrer erro no Prisma', async () => {
        const req = {
            params: {
                id: '10'
            }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        const next = jest.fn();

        const erro = new Error('Erro ao buscar simulação');

        prisma.simulacao.findUnique.mockRejectedValue(erro);

        await buscarPorId(req, res, next);

        expect(next).toHaveBeenCalledWith(erro);

        expect(res.json).not.toHaveBeenCalled();
    });
});