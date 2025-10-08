const request = require('supertest');
const { expect } = require('chai');

describe('Teste via HTTP External - Register User', () => {
    describe('POST /api/users/register', () => {
        it('Quando informo e-mail já cadastrado, deve retornar 400. O usuário não é registrado', async () => {
            const resposta = await request('http://localhost:3000')
                .post('/api/users/register')
                .send({
                    name: 'Alice Silva',
                    email: 'alice@email.com', 
                    password: "123456"
            });
            expect(resposta.status).to.equal(400);
            expect(resposta.body).to.have.property('error', 'Email já cadastrado');
            console.log(resposta.body);
        });

    });

    describe('POST /api/users/login', () => {
        it('Quando informo dados inválidos, deve retornar 401. O login não é realizado', async () => {
            const resposta = await request('http://localhost:3000')
                .post('/api/users/login')
                .send({
                    email: 'teste', 
                    password: "teste"
            });
            expect(resposta.status).to.equal(401);
            expect(resposta.body).to.have.property('error', 'Credenciais inválidas');
            console.log(resposta.body);
        });
    });
});