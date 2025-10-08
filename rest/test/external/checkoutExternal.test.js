const request = require('supertest');
const { expect } = require('chai');

describe('Teste via HTTP External - API Checkout', () => {
    describe('POST /api/checkout', () => {
            beforeEach(async () => {
                const responseLogin = await request('http://localhost:3000')
                .post('/api/users/login')
                .send({
                    email: 'alice@email.com',
                    password: '123456'
                });
                console.log(responseLogin.body);
                token = responseLogin.body.token;
            });
        it('Quando informo dados válidos, deve retornar 200. O Checkout é realizado', async () => {
            const resposta = await request('http://localhost:3000')
                .post('/api/checkout')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    items: [
                        { productId: 1, quantity: 2 },],
                    freight: 10,
                    paymentMethod: "boleto", 
                    cardData: {
                        "number": "string",
                        "name": "string",
                        "expiry": "string",
                        "cvv": "string"
                    }
                });
            expect(resposta.status).to.equal(200);
            console.log(resposta.body);
        });

        it('Quando informo produto inexistente, deve retornar 400. O Checkout não é realizado', async () => {
            const resposta = await request('http://localhost:3000')
                .post('/api/checkout')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    items: [
                        { productId: 5, quantity: 3 },],
                    freight: 10,
                    paymentMethod: "boleto", 
                    cardData: {
                        "number": "string",
                        "name": "string",
                        "expiry": "string",
                        "cvv": "string"
                    }
                });
            expect(resposta.status).to.equal(400);
            expect(resposta.body).to.have.property('error', 'Produto não encontrado');
            console.log(resposta.body);
        });

                it('Quando não informo dados do cartão para paymentMethod igual a credit_card, deve retornar 400. O Checkout não é realizado', async () => {
            const resposta = await request('http://localhost:3000')
                .post('/api/checkout')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    items: [
                        { productId: 2, quantity: 3 },],
                    freight: 10,
                    paymentMethod: "credit_card"
                });
            expect(resposta.status).to.equal(400);
            expect(resposta.body).to.have.property('error', 'Dados do cartão obrigatórios para pagamento com cartão');
            console.log(resposta.body);
        });
    });
});