var expect = require('chai').expect;
var request = require('supertest');

describe('coffee store', function() {
    var api = request('http://localhost:8001');
    it('can order americano', function(done) {
        var order = { order: { drink: 'americano' } };
        api.post('/orders').send(order).end(function(err, res) {
            expect(err).to.not.exist;
            expect(res.status).to.equal(201);
            expect(res.body.order.id).to.equal(1);
            expect(res.body.order.drink).to.equal('americano');
            expect(res.body.order.cost).to.equal(3);
            expect(res.body.order.next).to.exist;
            done();
        });
    });
    it('can order latte', function(done) {
        var order = { order: { drink: 'latte' } };
        api.post('/orders').send(order).end(function(err, res) {
            expect(err).to.not.exist;
            expect(res.status).to.equal(201);
            expect(res.body.order.drink).to.equal('latte');
            done();
        });
    });
});