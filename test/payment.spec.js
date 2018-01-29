var expect = require('expect.js')
var request = require('supertest')

describe('payment', function() {
    const app = require('../server/store-app')();
    const api = request(app);
    describe('options', function() {
        describe('error when', function() {
            it('order not found', function(done) {
                api.options('/payments/orders/7').end(function(err, res) {
                    expect(res.status).to.equal(404)
                    expect(res.body.error).to.contain('no such order')
                    done()
                });
            })
        })
        describe('modifiable', function() {
            it('allows put', function(done) {
                api.options('/payments/orders/6').end(function(err, res) {
                    expect(res.status).to.equal(200)
                    expect(res.headers).to.have.key('allow');
                    expect(res.headers['allow']).to.equal('GET, PUT');
                    done()
                });

            })
        })
        describe('not modifiable', function() {
            it('disallows put', function(done) {
                api.options('/payments/orders/5').end(function(err, res) {
                    expect(res.status).to.equal(200)
                    expect(res.headers).to.have.key('allow');
                    expect(res.headers['allow']).to.equal('GET');
                    done()
                });
            })
        })
    })
})