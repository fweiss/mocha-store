var expect = require('expect.js')
var request = require('supertest')

const dao = require('./fake-dao')

describe('payments', function() {
    const app = require('../../server/store-app')(dao);
    const api = request(app);
    describe('options', function() {
        describe('error when', function() {
            it('order not found', function(done) {
                api.options('/payment/orders/7').end(function(err, res) {
                    expect(res.status).to.equal(404)
                    expect(res.body.error).to.contain('no such order')
                    done()
                });
            })
        })
        describe('modifiable', function() {
            it('allows put', function(done) {
                api.options('/payment/orders/6').end(function(err, res) {
                    expect(res.status).to.equal(200)
                    expect(res.headers).to.have.key('allow');
                    expect(res.headers['allow']).to.equal('GET, PUT');
                    done()
                });

            })
        })
        describe('not modifiable', function() {
            it('disallows put', function(done) {
                api.options('/payment/orders/5').end(function(err, res) {
                    expect(res.status).to.equal(200)
                    expect(res.headers).to.have.key('allow');
                    expect(res.headers['allow']).to.equal('GET');
                    done()
                });
            })
        })
    })
    describe('put', function() {
        describe('error when', function() {
            it('no body', function(done) {
                api.put('/payment/order/1').end(function(err, res) {
                    expect(res.status).to.equal(400)
                    expect(res.body.error).to.contain('no request body')
                    done()
                })
            })
            it('no payment object', function(done) {
                api.put('/payment/order/1').send({ no: 'payemnt' }).end(function(err, res) {
                    expect(res.status).to.equal(400)
                    expect(res.body.error).to.contain('no payment object')
                    done()
                })
            })
            describe('payment', function() {
                // var res
                // beforeEach(function(done) {
                //     api.put('/payments/order/1').send({ payment: {} }).end(function(err, response) {
                //         res = response
                //         done()
                //     })
                // })
                it('no card number', function(done) {
                    api.put('/payment/order/1').send({ payment: {} }).end(function(err, res) {
                        expect(res.status).to.equal(400)
                        expect(res.body.error).to.contain('no card number')
                        done()
                    })
                })
                it('no expiration date', function(done) {
                    api.put('/payment/order/1').send({ payment: { cardNumber: '123' } }).end(function(err, res) {
                        expect(res.status).to.equal(400)
                        expect(res.body.error).to.contain('no expiration date')
                        done()
                    })
                })
                it('no cardmember name', function(done) {
                    api.put('/payment/order/1').send({ payment: { cardNumber: '123', expirationDate: '20180201' } }).end(function(err, res) {
                        expect(res.status).to.equal(400)
                        expect(res.body.error).to.contain('no cardholder name')
                        done()
                    })
               })
                it('no amount', function(done) {
                    api.put('/payment/order/1').send({ payment: { cardNumber: '123', expirationDate: '20180201', cardholderName: 'John Doe' } }).end(function(err, res) {
                        expect(res.status).to.equal(400)
                        expect(res.body.error).to.contain('no amount')
                        done()
                    })
                })
            })
        })
        it('success', function(done) {
            api.put('/payment/order/1').send({ payment: { cardNumber: '123', expirationDate: '20180201', cardholderName: 'John Doe', amount: '4.40' } }).end(function(err, res) {
                expect(res.status).to.equal(201)
                done()
            })
        })
        describe('response', function() {
            var res
            beforeEach(function(done) {
                const payment = { payment: { cardNumber: '1234', expirationDate: '1802', cardholderName: 'John Doe', amount: '3.40' } }
                api.put('/payment/order/3').send(payment).end(function(err, response) {
                    expect(response.status).to.equal(201)
                    res = response
                    done()
                })
            })
            it('amount', function() {
                expect(res.body.payment.amount).to.equal('3.40')
            })
        })
    })
})