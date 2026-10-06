jest.mock('../src/repositories/municipio.repository', () => ({
    listarTodos: jest.fn(),
    buscarPorId: jest.fn(),
    criar: jest.fn(),
    atualizar: jest.fn(),
    remover: jest.fn()
}));

const municipioRepository = require('../src/repositories/municipio.repository');

const {
    listarMunicipios,
    buscarMunicipio,
    criarMunicipio,
    atualizarMunicipio,
    removerMunicipio
} = require('../src/services/municipio.service');

describe('Municipio Service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('deve listar municípios', async () => {
        const municipios = [
            {
                id: 1,
                nome: 'Salvador',
                uf: 'BA'
            }
        ];

        municipioRepository.listarTodos.mockResolvedValue(municipios);

        const resultado = await listarMunicipios();

        expect(municipioRepository.listarTodos).toHaveBeenCalled();
        expect(resultado).toEqual(municipios);
    });

    test('deve buscar município por ID', async () => {
        const municipio = {
            id: 1,
            nome: 'Salvador',
            uf: 'BA'
        };

        municipioRepository.buscarPorId.mockResolvedValue(municipio);

        const resultado = await buscarMunicipio(1);

        expect(municipioRepository.buscarPorId).toHaveBeenCalledWith(1);
        expect(resultado).toEqual(municipio);
    });

    test('deve retornar erro 404 quando município não existe', async () => {
        municipioRepository.buscarPorId.mockResolvedValue(null);

        await expect(
            buscarMunicipio(99)
        ).rejects.toMatchObject({
            message: 'Município não encontrado',
            status: 404
        });
    });

    test('deve criar município convertendo UF para maiúsculo', async () => {
        const municipio = {
            id: 2,
            nome: 'Feira de Santana',
            uf: 'BA',
            populacao: 616000,
            idh: 0.712
        };

        municipioRepository.criar.mockResolvedValue(municipio);

        const resultado = await criarMunicipio({
            nome: 'Feira de Santana',
            uf: 'ba',
            populacao: 616000,
            idh: 0.712
        });

        expect(municipioRepository.criar).toHaveBeenCalledWith({
            nome: 'Feira de Santana',
            uf: 'BA',
            populacao: 616000,
            idh: 0.712
        });

        expect(resultado).toEqual(municipio);
    });

    test('deve usar null para população e IDH quando não informados', async () => {
        municipioRepository.criar.mockResolvedValue({
            id: 3,
            nome: 'Salvador',
            uf: 'BA',
            populacao: null,
            idh: null
        });

        await criarMunicipio({
            nome: 'Salvador',
            uf: 'ba'
        });

        expect(municipioRepository.criar).toHaveBeenCalledWith({
            nome: 'Salvador',
            uf: 'BA',
            populacao: null,
            idh: null
        });
    });

    test('deve rejeitar criação sem nome', async () => {
        await expect(
            criarMunicipio({
                uf: 'BA'
            })
        ).rejects.toMatchObject({
            message: 'Nome e UF são obrigatórios',
            status: 400
        });
    });

    test('deve rejeitar criação sem UF', async () => {
        await expect(
            criarMunicipio({
                nome: 'Salvador'
            })
        ).rejects.toMatchObject({
            message: 'Nome e UF são obrigatórios',
            status: 400
        });
    });

    test('deve rejeitar UF com tamanho diferente de 2', async () => {
        await expect(
            criarMunicipio({
                nome: 'Salvador',
                uf: 'BAH'
            })
        ).rejects.toMatchObject({
            message: 'UF deve possuir 2 caracteres',
            status: 400
        });
    });

    test('deve atualizar município', async () => {
        const municipio = {
            id: 2,
            nome: 'Feira de Santana',
            uf: 'BA'
        };

        municipioRepository.buscarPorId.mockResolvedValue(municipio);

        const municipioAtualizado = {
            id: 2,
            nome: 'Feira de Santana',
            uf: 'BA',
            codigoIbge: '2910800',
            populacao: 616000,
            idh: 0.712
        };

        municipioRepository.atualizar.mockResolvedValue(
            municipioAtualizado
        );

        const resultado = await atualizarMunicipio(2, {
            nome: 'Feira de Santana',
            uf: 'ba',
            codigoIbge: '2910800',
            populacao: 616000,
            idh: 0.712
        });

        expect(municipioRepository.buscarPorId).toHaveBeenCalledWith(2);

        expect(municipioRepository.atualizar).toHaveBeenCalledWith(2, {
            nome: 'Feira de Santana',
            uf: 'BA',
            codigoIbge: '2910800',
            populacao: 616000,
            idh: 0.712
        });

        expect(resultado).toEqual(municipioAtualizado);
    });

    test('deve atualizar município permitindo UF não informada', async () => {
        municipioRepository.buscarPorId.mockResolvedValue({
            id: 2,
            nome: 'Feira de Santana',
            uf: 'BA'
        });

        municipioRepository.atualizar.mockResolvedValue({
            id: 2,
            nome: 'Feira de Santana Atualizada'
        });

        await atualizarMunicipio(2, {
            nome: 'Feira de Santana Atualizada'
        });

        expect(municipioRepository.atualizar).toHaveBeenCalledWith(2, {
            nome: 'Feira de Santana Atualizada',
            uf: undefined,
            codigoIbge: undefined,
            populacao: undefined,
            idh: undefined
        });
    });

    test('deve remover município', async () => {
        const municipio = {
            id: 2,
            nome: 'Feira de Santana',
            uf: 'BA'
        };

        municipioRepository.buscarPorId.mockResolvedValue(municipio);
        municipioRepository.remover.mockResolvedValue(municipio);

        const resultado = await removerMunicipio(2);

        expect(municipioRepository.buscarPorId).toHaveBeenCalledWith(2);
        expect(municipioRepository.remover).toHaveBeenCalledWith(2);
        expect(resultado).toEqual(municipio);
    });
});