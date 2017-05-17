var expect = require('expect.js');
var request = require('supertest');

describe('coffee store', function() {
    //var api = request('http://localhost:8001');
    var api = request(require('../server/store-app')());

    function apiPost(resource, entity, expectedStatus, callback) {
        api.post(resource).send(entity).end(function(err, res) {
            expect(err).to.equal(null);
            expect(res.status).to.equal(expectedStatus);
            callback(res);
        });
    }
    function apiOptions(resource, callback) {
        api.options(resource).send().end(function(err, res) {
            expect(err).to.equal(null);
            expect(res.status).to.equal(200);
            callback(res);
        });
    }
    function apiPut(resource, data, expectedStatus, callback) {
        api.put(resource).send(data).end(function(err, res) {
            expect(err).to.equal(null);
            expect(res.status).to.equal(expectedStatus);
            callback(res);
        });
    }

    describe('order', function() {
        describe('create', function() {
            it('can order americano', function(done) {
                var order = { order: { drink: 'americano' } };
                apiPost('/orders', order, 201, function(res) {
                    expect(res.body.order.id).to.equal(1);
                    expect(res.body.order.drink).to.equal('americano');
                    expect(res.body.order.cost).to.equal(3);
                    expect(res.body.order.next).to.be.ok();
                    done();
                });
            });
            it('can order latte', function(done) {
                var order = { order: { drink: 'latte' } };
                apiPost('/orders', order, 201, function(res) {
                    expect(res.body.order.drink).to.equal('latte');
                    done();
                });
            });
            it('has hypermedia link', function(done) {
                var order = { order: { drink: 'latte' } };
                apiPost('/orders', order, 201, function(res) {
                    expect(res.body.order.next).to.be.ok();
                    expect(res.body.order.next.rel).to.equal('payment');
                    expect(res.body.order.next.href).to.equal('http://localhost:8001/payment/order/1');
                    expect(res.body.order.next.type).to.equal('application/json');
                    done();
                });
            });
        });
        describe('modify', function() {
            describe('validation', function() {
                it('requires order', function(done) {
                    apiPut('/orders/1', { notorder: {} }, 400, function(res) {
                        expect(res.body).to.be.ok();
                        expect(res.body.error).to.be.ok();
                        expect(res.body.error.message).to.equal('Expected an "order" object');
                        done();
                    });
                });
            });
            it('can query existence', function(done) {
                apiOptions('/orders/1', function(res) {
                    expect(res.headers).to.have.key('allow');
                    expect(res.headers['allow']).to.equal('GET, PUT');
                    done();
                });
            });
            it('can add shot', function(done) {
                var partialOrder = { order: { additions: 'tor' }};
                api.put('/orders/1').send(partialOrder).set('Expect', '100-Continue').end(function(err, res) {
                    expect(err).to.equal(null);
                    expect(res.status).to.equal(200);
                    expect(res.body.order.additions).to.equal('tor');
                    done();
                });
            });
        });
    });
    describe('payment', function() {
        describe('for order', function() {
            it('describes actions', function(done) {
                apiOptions('/payments/orders/1', function(res) {
                    expect(res.headers).to.have.key('allow');
                    expect(res.headers['allow']).to.equal('GET, PUT');
                    done();
                });
            });
            it('can be made', function(done) {
                var payment = { payment: { cardNumber: '123456', expirationDate: '11/20', cardholderName: 'John Doe', amount: 4.40 }};
                api.put('/payments/orders/1').send(payment).end(function(err, res) {
                    expect(err).to.equal(null);
                    expect(res.status).to.equal(201);
                    expect(res.body.payment.amount).to.equal(4.40);
                    done();
                });

            });
        });

    });


 });