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
                        expect(res.body.error).to.contain('no data')
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
        })
    })
})
