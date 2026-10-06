jest.mock('../src/lib/prisma', () => ({
    $executeRaw: jest.fn(),
    $queryRaw: jest.fn()
}));

const prisma = require('../src/lib/prisma');

const {
    atualizarCoordenadas,
    listarComCoordenadas
} = require('../src/services/municipio-coordenadas.service');

describe('Serviço de coordenadas dos municípios', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('atualizarCoordenadas', () => {

        test('deve rejeitar ID do município inválido', async () => {
            await expect(
                atualizarCoordenadas('abc', -12.97, -38.50)
            ).rejects.toMatchObject({
                message: 'ID do município inválido',
                status: 400
            });

            expect(prisma.$executeRaw).not.toHaveBeenCalled();
        });

        test('deve rejeitar latitude inválida', async () => {
            await expect(
                atualizarCoordenadas(1, -91, -38.50)
            ).rejects.toMatchObject({
                message: 'Latitude ou longitude inválida',
                status: 400
            });

            expect(prisma.$executeRaw).not.toHaveBeenCalled();
        });

        test('deve rejeitar longitude inválida', async () => {
            await expect(
                atualizarCoordenadas(1, -12.97, 181)
            ).rejects.toMatchObject({
                message: 'Latitude ou longitude inválida',
                status: 400
            });

            expect(prisma.$executeRaw).not.toHaveBeenCalled();
        });

        test('deve rejeitar coordenadas não numéricas', async () => {
            await expect(
                atualizarCoordenadas(1, 'abc', 'def')
            ).rejects.toMatchObject({
                message: 'Latitude ou longitude inválida',
                status: 400
            });

            expect(prisma.$executeRaw).not.toHaveBeenCalled();
        });

        test('deve rejeitar quando o município não for encontrado', async () => {
            prisma.$executeRaw.mockResolvedValue(0);

            await expect(
                atualizarCoordenadas(999, -12.97, -38.50)
            ).rejects.toMatchObject({
                message: 'Município não encontrado',
                status: 404
            });

            expect(prisma.$executeRaw).toHaveBeenCalledTimes(1);
        });

        test('deve atualizar as coordenadas com sucesso', async () => {
            prisma.$executeRaw.mockResolvedValue(1);

            const resultado = await atualizarCoordenadas(
                2,
                -12.9777,
                -38.5016
            );

            expect(resultado).toEqual({
                message: 'Coordenadas atualizadas com sucesso'
            });

            expect(prisma.$executeRaw).toHaveBeenCalledTimes(1);
        });

        test('deve aceitar os limites válidos das coordenadas', async () => {
            prisma.$executeRaw.mockResolvedValue(1);

            const resultado = await atualizarCoordenadas(
                1,
                90,
                180
            );

            expect(resultado).toEqual({
                message: 'Coordenadas atualizadas com sucesso'
            });

            expect(prisma.$executeRaw).toHaveBeenCalledTimes(1);
        });

    });

    describe('listarComCoordenadas', () => {

        test('deve retornar municípios com coordenadas', async () => {
            const municipios = [
                {
                    id: 1,
                    nome: 'Salvador',
                    uf: 'BA',
                    populacao: 2400000,
                    idh: 0.759,
                    latitude: -12.9777,
                    longitude: -38.5016
                }
            ];

            prisma.$queryRaw.mockResolvedValue(municipios);

            const resultado = await listarComCoordenadas();

            expect(resultado).toEqual(municipios);
            expect(prisma.$queryRaw).toHaveBeenCalledTimes(1);
        });

        test('deve retornar lista vazia quando não houver municípios com coordenadas', async () => {
            prisma.$queryRaw.mockResolvedValue([]);

            const resultado = await listarComCoordenadas();

            expect(resultado).toEqual([]);
            expect(prisma.$queryRaw).toHaveBeenCalledTimes(1);
        });

    });

});