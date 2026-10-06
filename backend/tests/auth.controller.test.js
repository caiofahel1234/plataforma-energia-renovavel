jest.mock('../src/services/auth.service', () => ({
    registrarUsuario: jest.fn(),
    login: jest.fn()
}));

const authService = require('../src/services/auth.service');

const {
    registrar,
    login
} = require('../src/controllers/auth.controller');

describe('Controller de autenticação', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('registrar', () => {

        test('deve registrar usuário com sucesso', async () => {
            const req = {
                body: {
                    nome: 'Caio',
                    email: 'caio@teste.com',
                    senha: '123456',
                    perfil: 'admin'
                }
            };

            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            const next = jest.fn();

            const usuario = {
                id: 1,
                nome: 'Caio',
                email: 'caio@teste.com',
                perfil: 'admin'
            };

            authService.registrarUsuario.mockResolvedValue(usuario);

            await registrar(req, res, next);

            expect(authService.registrarUsuario)
                .toHaveBeenCalledWith({
                    nome: 'Caio',
                    email: 'caio@teste.com',
                    senha: '123456',
                    perfil: 'admin'
                });

            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(usuario);
            expect(next).not.toHaveBeenCalled();
        });

        test('deve chamar next quando ocorrer erro ao registrar', async () => {
            const req = {
                body: {
                    nome: 'Caio',
                    email: 'caio@teste.com',
                    senha: '123456',
                    perfil: 'admin'
                }
            };

            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            const next = jest.fn();

            const erro = new Error('Email já cadastrado');

            authService.registrarUsuario.mockRejectedValue(erro);

            await registrar(req, res, next);

            expect(next).toHaveBeenCalledWith(erro);
            expect(res.status).not.toHaveBeenCalled();
            expect(res.json).not.toHaveBeenCalled();
        });
    });

    describe('login', () => {

        test('deve realizar login com sucesso', async () => {
            const req = {
                body: {
                    email: 'caio@teste.com',
                    senha: '123456'
                }
            };

            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            const next = jest.fn();

            const resultado = {
                token: 'token-teste',
                usuario: {
                    id: 1,
                    nome: 'Caio',
                    email: 'caio@teste.com',
                    perfil: 'admin'
                }
            };

            authService.login.mockResolvedValue(resultado);

            await login(req, res, next);

            expect(authService.login)
                .toHaveBeenCalledWith({
                    email: 'caio@teste.com',
                    senha: '123456'
                });

            expect(res.json).toHaveBeenCalledWith(resultado);
            expect(next).not.toHaveBeenCalled();
        });

        test('deve chamar next quando ocorrer erro ao realizar login', async () => {
            const req = {
                body: {
                    email: 'caio@teste.com',
                    senha: '123456'
                }
            };

            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            const next = jest.fn();

            const erro = new Error('Credenciais inválidas');

            authService.login.mockRejectedValue(erro);

            await login(req, res, next);

            expect(next).toHaveBeenCalledWith(erro);
            expect(res.status).not.toHaveBeenCalled();
            expect(res.json).not.toHaveBeenCalled();
        });
    });
});