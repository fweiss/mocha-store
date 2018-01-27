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
                it('order has no drink', function(done) {
                    api.post('/orders').send({ order: {} }).end(function(err, res) {
                        expect(err).to.equal(null);
                        expect(res.status).to.equal(400)
                        expect(res.body.error).to.contain('missing drink object')
                        done()
                    });
                })
            })
            it('is successful', function(done) {
                api.post('/orders').send({ order: { drink: 'latte' } }).end(function(err, res) {
                    expect(err).to.equal(null);
                    expect(res.status).to.equal(201)
                    done()
                });
            })
        })
    })
})
