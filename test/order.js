var expect = require('expect.js')
var request = require('supertest')

describe('order', function() {
    var app = require('../server/store-app')();
    var api = request(app);
    describe('entity', function() {
        describe('post', function() {
            describe('error when', function() {
                it('empty body', function(done) {
                    api.post('/orders').end(function(err, res) {
                        expect(err).to.equal(null);
                        expect(res.status).to.equal(400)
                        expect(res.body.error).to.contain('empty request body')
                        done()
                    });
                })
                it('no order object', function(done) {
                    api.post('/orders').send({}).end(function(err, res) {
                        expect(err).to.equal(null);
                        expect(res.status).to.equal(400)
                        expect(res.body.error).to.contain('missing order object')
                        done()
                    });
                })
                it('no drink object', function(done) {
                    api.post('/orders').send({ order: {} }).end(function(err, res) {
                        expect(err).to.equal(null);
                        expect(res.status).to.equal(400)
                        expect(res.body.error).to.contain('missing drink object')
                        done()
                    });
                })
            })
            describe('a latte', function() {
                var res
                beforeEach(function(done) {
                    api.post('/orders').send({ order: { drink: 'latte' } }).end(function(err, response) {
                        res = response
                        done()
                    })
                })
                it('is successful', function() {
                    expect(res.status).to.equal(201)
                })
                describe('response', function() {
                    it('has drink', function() {
                        expect(res.body.order.drink).to.equal('latte')
                    })
                    it('has cost', function() {
                        expect(res.body.order.cost).to.equal('3.00')
                    })
                })
                describe('hypermedia link', function() {
                    it('for payment', function() {
                        expect(res.body.order.links.payment).to.eql({ uri: '/payment/order/1234' })
                    })
                })
            })
         })
        describe('options', function() {
            describe('error when', function() {
                it('order not found', function(done) {
                    api.options('/orders/7').end(function(err, res) {
                        expect(err).to.equal(null);
                        expect(res.status).to.equal(404)
                        expect(res.body.error).to.contain('no such order')
                        done()
                    });
                })
            })
            describe('modifiable', function() {
                it('allows put', function(done) {
                    api.options('/orders/6').end(function(err, res) {
                        expect(err).to.equal(null);
                        expect(res.status).to.equal(200)
                        expect(res.headers).to.have.key('allow');
                        expect(res.headers['allow']).to.equal('GET, PUT');
                        done()
                    });

                })
            })
            describe('not modifiable', function() {
                it('disallows put', function(done) {
                    api.options('/orders/5').end(function(err, res) {
                        expect(res.status).to.equal(200)
                        expect(res.headers).to.have.key('allow');
                        expect(res.headers['allow']).to.equal('GET');
                        done()
                    });
                })
            })
        })
        describe('put', function() {
            // although the guide indicated optionally doing a "trial" put with Expect: 100-Continue, we'll defer that
            describe('error when', function() {
                it('no body', function(done) {
                    api.put('/orders/1').end(function(err, res) {
                        expect(res.status).to.equal(400);
                        expect(res.body.error).to.contain('empty request body');
                        done();
                    });
                })
                it('no order object', function(done) {
                    api.put('/orders/1').send({}).end(function(err, res) {
                        expect(res.status).to.equal(400);
                        expect(res.body.error).to.contain('missing order object');
                        done();
                    });
                })
            })
            describe('expect continue', function() {
                describe('modifiable', function() {
                    it('succeeds', function(done) {
                        var partialOrder = { order: { additions: 'tor' }};
                        api.put('/orders/1').set('Expect', '100-Continue').send(partialOrder).end(function(err, res) {
                            expect(err).to.equal(null);
                            expect(res.status).to.equal(200);
                            expect(res.body.order.additions).to.equal('tor');
                            done();
                        });
                    })
                })
            })
        })
    })
})
