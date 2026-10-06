const request = require('supertest');
const app = require('../src/app');

describe('API', () => {

    test('GET / deve retornar mensagem da API', async () => {
        const response = await request(app)
            .get('/');

        expect(response.statusCode).toBe(200);

expect(response.body).toEqual({
    mensagem: 'API da Plataforma de Energia Renovável'
});
    });

        test('POST /api/auth/registrar deve rejeitar cadastro sem dados obrigatórios', async () => {
        const response = await request(app)
            .post('/api/auth/registrar')
            .send({
                nome: 'Caio'
            });

        expect(response.statusCode).toBe(400);

        expect(response.body).toEqual({
            error: 'nome, email e senha são obrigatórios'
        });
    });

    test('POST /api/auth/login deve rejeitar login sem dados obrigatórios', async () => {
        const response = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'caio@teste.com'
            });

        expect(response.statusCode).toBe(400);

        expect(response.body).toEqual({
            error: 'email e senha são obrigatórios'
        });
    });

});