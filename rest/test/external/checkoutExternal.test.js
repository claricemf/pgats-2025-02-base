const request = require('supertest');
const { expect } = require('chai');

describe('Teste via HTTP API Checkout', () => {
    describe('POST /api/checkout', () => {
        it('Quando informo dados válidos, deve retornar 200. O Checkout é realizado', async () => {
            const resposta = await request('http://localhost:3000')
                .post('/api/checkout')
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
    });

});