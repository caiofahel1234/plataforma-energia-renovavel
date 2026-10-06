const jwt = require('jsonwebtoken');

const autenticar = require('../src/middlewares/auth.middleware');

jest.mock('jsonwebtoken');

describe('Middleware de autenticação', () => {

    beforeEach(() => {
        jest.clearAllMocks();
        process.env.JWT_SECRET = 'segredo-teste';
    });

    test('deve retornar 401 quando o token não for informado', () => {
        const req = {
            headers: {}
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        const next = jest.fn();

        autenticar(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({
            error: 'Token não informado'
        });
        expect(next).not.toHaveBeenCalled();
    });

    test('deve retornar 401 quando o formato do token for inválido', () => {
        const req = {
            headers: {
                authorization: 'Token abc123'
            }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        const next = jest.fn();

        autenticar(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({
            error: 'Formato do token inválido'
        });
        expect(next).not.toHaveBeenCalled();
    });

    test('deve retornar 401 quando o Bearer estiver sem token', () => {
        const req = {
            headers: {
                authorization: 'Bearer'
            }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        const next = jest.fn();

        autenticar(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({
            error: 'Formato do token inválido'
        });
        expect(next).not.toHaveBeenCalled();
    });

    test('deve autenticar quando o token for válido', () => {
        const usuario = {
            id: 1,
            email: 'caio@teste.com',
            perfil: 'admin'
        };

        jwt.verify.mockReturnValue(usuario);

        const req = {
            headers: {
                authorization: 'Bearer token-valido'
            }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        const next = jest.fn();

        autenticar(req, res, next);

        expect(jwt.verify).toHaveBeenCalledWith(
            'token-valido',
            'segredo-teste'
        );

        expect(req.usuario).toEqual(usuario);
        expect(next).toHaveBeenCalled();
        expect(res.status).not.toHaveBeenCalled();
    });

    test('deve retornar 401 quando o token for inválido ou expirado', () => {
        jwt.verify.mockImplementation(() => {
            throw new Error('Token inválido');
        });

        const req = {
            headers: {
                authorization: 'Bearer token-invalido'
            }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        const next = jest.fn();

        autenticar(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({
            error: 'Token inválido ou expirado'
        });
        expect(next).not.toHaveBeenCalled();
    });

});