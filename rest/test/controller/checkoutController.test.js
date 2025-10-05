const request = require('supertest');
const sinon = require('sinon');
const { expect } = require('chai');

const app = require('../../app');
const e = require('express');

describe('Checkout Controller', () => {
    describe('POST /api/checkout', () => {
        it('Quando informo dados válidos, deve retornar 200. O Checkout é realizado', async () => {
            const resposta = await request(app)
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

        it('Quando informo produto inexistente, deve retornar 400. O Checkout não é realizado', async () => {
            const resposta = await request(app)
                .post('/api/checkout')
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
    });
});