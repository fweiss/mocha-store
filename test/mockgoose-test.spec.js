var expect = require('expect.js')
var request = require('supertest')

// var mockgoose = require('mockgoose')
// var mongoose = require('mongoose')
//
// mockgoose(mongoose)

// https://github.com/Mockgoose/Mockgoose/issues/6

var Mongoose = require('mongoose').Mongoose;
var mongoose = new Mongoose();

var Mockgoose = require('mockgoose').Mockgoose;
var mockgoose = new Mockgoose(mongoose);

describe.only('db2', function() {
    var app = require('../server/mockgoose-test')(mongoose);
    var api = request(app);
    var Order
    // create the schema once per test suit
    before(function(done) {
        mockgoose.prepareStorage()
            .then(function () {
                return mongoose.connect('mongodb://example.com/TestingDB')
            })
            .then(function() {
                var schema = new mongoose.Schema({ drink: 'string', cost: 'string' });
                Order = mongoose.model('Order', schema);
            })
            .then(function() { done() })
            .catch(function(err) { done(err) })
    })
    // create a fresh documents test fixture for each test
    beforeEach(function(done) {
        mockgoose.helper.reset().then(function() {
            var small = new Order({ drink: 'latte', cost: '3.40'})
            small.save(function() {
                done()
            })
        })

        // create and insert two dummy docs
        // Tank.model.create({ text: 'write blog on A' }, { text: 'write blog on B' }, function(err, blogOnA, blogOnB) {
        //     if(err) {
        //         console.log('Error creating documents in beforeEach: ' + error);
        //         throw(err);
        //     }
        //     done();
        // });
    })
    it('post order', function(done) {
        const newOrder = { drink: 'mocha', cost: '4.40' }
        api.post('/test').send(newOrder).end(function(err, res) {
            const id = res.body._id
            Order.find({ _id: id }, 'drink cost').then(function(orders) {
                expect(orders.length).to.be(1)
                expect(orders[0].drink).to.be('mocha')
                done()
            }).catch(function(err) { done(err) })
        })
    })

    it('get order', function(done) {
        api.get('/test').end(function(err, res) {
            expect(res.body.length).to.be(1)
            const order = res.body[0]
            expect(order.drink).to.eql('latte')
            expect(order.cost).to.be('3.40')
            done()
        })
    })
})

