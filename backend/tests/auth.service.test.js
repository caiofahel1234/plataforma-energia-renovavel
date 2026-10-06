jest.mock('../src/lib/prisma', () => ({
    usuario: {
        findUnique: jest.fn(),
        create: jest.fn()
    }
}));

jest.mock('bcryptjs', () => ({
    hash: jest.fn(),
    compare: jest.fn()
}));

jest.mock('jsonwebtoken', () => ({
    sign: jest.fn()
}));

const prisma = require('../src/lib/prisma');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const {
    registrarUsuario,
    login
} = require('../src/services/auth.service');

describe('Serviço de autenticação', () => {

    beforeEach(() => {
        jest.clearAllMocks();
        process.env.JWT_SECRET = 'segredo-teste';
    });

    test('deve registrar um novo usuário', async () => {
        prisma.usuario.findUnique.mockResolvedValue(null);

        bcrypt.hash.mockResolvedValue('hash-da-senha');

        const usuarioCriado = {
            id: 1,
            nome: 'Caio',
            email: 'caio@teste.com',
            perfil: 'usuario',
            ativo: true,
            createdAt: new Date()
        };

        prisma.usuario.create.mockResolvedValue(usuarioCriado);

        const resultado = await registrarUsuario({
            nome: 'Caio',
            email: 'caio@teste.com',
            senha: '123456'
        });

        expect(bcrypt.hash).toHaveBeenCalledWith(
            '123456',
            10
        );

        expect(prisma.usuario.create).toHaveBeenCalledTimes(1);

        expect(resultado).toEqual(usuarioCriado);
    });

    test('deve rejeitar e-mail já cadastrado', async () => {
        prisma.usuario.findUnique.mockResolvedValue({
            id: 1,
            email: 'caio@teste.com'
        });

        await expect(
            registrarUsuario({
                nome: 'Caio',
                email: 'caio@teste.com',
                senha: '123456'
            })
        ).rejects.toMatchObject({
            message: 'E-mail já cadastrado',
            status: 409
        });

        expect(prisma.usuario.create).not.toHaveBeenCalled();
    });

    test('deve fazer login com credenciais válidas', async () => {
        prisma.usuario.findUnique.mockResolvedValue({
            id: 1,
            nome: 'Caio',
            email: 'caio@teste.com',
            senhaHash: 'hash-da-senha',
            perfil: 'usuario',
            ativo: true
        });

        bcrypt.compare.mockResolvedValue(true);

        jwt.sign.mockReturnValue('token-teste');

        const resultado = await login({
            email: 'caio@teste.com',
            senha: '123456'
        });

        expect(bcrypt.compare).toHaveBeenCalledWith(
            '123456',
            'hash-da-senha'
        );

        expect(jwt.sign).toHaveBeenCalledWith(
            {
                id: 1,
                email: 'caio@teste.com',
                perfil: 'usuario'
            },
            'segredo-teste',
            {
                expiresIn: '8h'
            }
        );

        expect(resultado.token).toBe('token-teste');

        expect(resultado.usuario).toEqual({
            id: 1,
            nome: 'Caio',
            email: 'caio@teste.com',
            perfil: 'usuario'
        });
    });

    test('deve rejeitar login de usuário inexistente', async () => {
        prisma.usuario.findUnique.mockResolvedValue(null);

        await expect(
            login({
                email: 'naoexiste@teste.com',
                senha: '123456'
            })
        ).rejects.toMatchObject({
            message: 'E-mail ou senha inválidos',
            status: 401
        });

        expect(bcrypt.compare).not.toHaveBeenCalled();
        expect(jwt.sign).not.toHaveBeenCalled();
    });

    test('deve rejeitar login de usuário inativo', async () => {
        prisma.usuario.findUnique.mockResolvedValue({
            id: 1,
            nome: 'Caio',
            email: 'caio@teste.com',
            senhaHash: 'hash-da-senha',
            perfil: 'usuario',
            ativo: false
        });

        await expect(
            login({
                email: 'caio@teste.com',
                senha: '123456'
            })
        ).rejects.toMatchObject({
            message: 'E-mail ou senha inválidos',
            status: 401
        });

        expect(bcrypt.compare).not.toHaveBeenCalled();
        expect(jwt.sign).not.toHaveBeenCalled();
    });

    test('deve rejeitar senha incorreta', async () => {
        prisma.usuario.findUnique.mockResolvedValue({
            id: 1,
            nome: 'Caio',
            email: 'caio@teste.com',
            senhaHash: 'hash-da-senha',
            perfil: 'usuario',
            ativo: true
        });

        bcrypt.compare.mockResolvedValue(false);

        await expect(
            login({
                email: 'caio@teste.com',
                senha: 'senha-errada'
            })
        ).rejects.toMatchObject({
            message: 'E-mail ou senha inválidos',
            status: 401
        });

        expect(jwt.sign).not.toHaveBeenCalled();
    });

});