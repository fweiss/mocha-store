//var chai = require('chai');
var expect = require('chai').expect;
var request = require('supertest');

describe('coffee', function() {
    var api = request('http://localhost:8001');
    it('adds new order', function(done) {
        api.post('/orders').send().end(function(err, res) {
            expect(err).to.not.exist;
            expect(res.status).to.equal(201);
            expect(res.body.order.drink).to.equal('latte');
            done();
        });
    });
});