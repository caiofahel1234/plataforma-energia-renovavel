const autorizar = require('../src/middlewares/autorizar.middleware');

describe('Middleware de autorização', () => {

    test('deve retornar 401 quando o usuário não estiver autenticado', () => {
        const req = {};

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        const next = jest.fn();

        autorizar('admin')(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({
            error: 'Usuário não autenticado'
        });
        expect(next).not.toHaveBeenCalled();
    });

    test('deve retornar 403 quando o perfil do usuário não for permitido', () => {
        const req = {
            usuario: {
                perfil: 'usuario'
            }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        const next = jest.fn();

        autorizar('admin')(req, res, next);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({
         error: 'Usuário sem permissão para realizar esta operação'
        });
        expect(next).not.toHaveBeenCalled();
    });

    test('deve chamar next quando o perfil do usuário for permitido', () => {
        const req = {
            usuario: {
                perfil: 'admin'
            }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        const next = jest.fn();

        autorizar('admin')(req, res, next);

        expect(next).toHaveBeenCalled();
        expect(res.status).not.toHaveBeenCalled();
        expect(res.json).not.toHaveBeenCalled();
    });

    test('deve permitir qualquer um dos perfis informados', () => {
        const req = {
            usuario: {
                perfil: 'gestor'
            }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        const next = jest.fn();

        autorizar('admin', 'gestor')(req, res, next);

        expect(next).toHaveBeenCalled();
    });

});