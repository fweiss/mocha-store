//var chai = require('chai');
var expect = require('chai').expect;
var request = require('supertest');

describe('coffee', function() {
    var server = 'http://localhost:8001';
    it('is ready', function(done) {
        request(server).post('/orders').send().expect(201).end(function(err, res) {
            if (err) {
                throw err;
            }
            expect(res.body.order.drink).to.equal('latte');
            done();
        });
    });
});