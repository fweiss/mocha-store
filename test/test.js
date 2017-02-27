var expect = require('chai').expect;
var request = require('supertest');

describe('coffee store', function() {
    //var api = request('http://localhost:8001');
    var api = request(require('../server/store-app')());

    function postWrapper(resource, entity, expectedStatus, callback) {
        api.post(resource).send(entity).end(function(err, res) {
            expect(err).to.not.exist;
            expect(res.status).to.equal(expectedStatus);
            callback(res);
        });
    }

    describe('orders', function() {
        describe('create', function() {
            it('can order americano', function(done) {
                var order = { order: { drink: 'americano' } };
                postWrapper('/orders', order, 201, function(res) {
                    expect(res.body.order.id).to.equal(1);
                    expect(res.body.order.drink).to.equal('americano');
                    expect(res.body.order.cost).to.equal(3);
                    expect(res.body.order.next).to.exist;
                    done();
                });
            });
            it('can order latte', function(done) {
                var order = { order: { drink: 'latte' } };
                postWrapper('/orders', order, 201, function(res) {
                    expect(res.body.order.drink).to.equal('latte');
                    done();
                });
            });
            it('has hypermedia link', function(done) {
                var order = { order: { drink: 'latte' } };
                postWrapper('/orders', order, 201, function(res) {
                    expect(res.body.order.next).to.exist;
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
                    api.put('/orders/1').send({ notorder: {} }).end(function(err, res) {
                        expect(err).to.not.exist;
                        expect(res.status).to.equal(400);
                        expect(res.body).to.exist;
                        expect(res.body.error).to.exist;
                        expect(res.body.error.message).to.equal('Expected an "order" object');
                        done();
                    });
                });
            });
            it('can query existence', function(done) {
                api.options('/orders/1').send().end(function(err, res) {
                    expect(err).to.not.exist;
                    expect(res.status).to.equal(200);
                    expect(res.headers['allow']).to.exist;
                    expect(res.headers['allow']).to.equal('GET, PUT');
                    done();
                });
            });
            it('can add shot', function(done) {
                var partialOrder = { order: { additions: 'tor' }};
                api.put('/orders/1').send(partialOrder).set('Expect', '100-Continue').end(function(err, res) {
                    expect(err).to.not.exist;
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
                api.options('/payments/orders/1').send().end(function(err, res) {
                    expect(err).to.not.exist;
                    expect(res.status).to.equal(200);
                    expect(res.headers['allow']).to.exist;
                    expect(res.headers['allow']).to.equal('GET, PUT');
                    done();
                });
            });
            xit('can be made', function(done) {
                var payment = { payment: { cardNumber: '123456', expirationDate: '11/20', cardholderName: 'John Doe'  }};
                api.put('/orders/1').send(payment).set('Expect', '100-Continue').end(function(err, res) {
                    expect(err).to.not.exist;
                    //expect(res.status).to.equal(200);
                    expect(res.body.order.additions).to.equal('tor');
                    done();
                });

            });
        });

    });


 });