var expect = require('expect.js')
var request = require('supertest')

// var mockgoose = require('mockgoose')
// var mongoose = require('mongoose')
//
// mockgoose(mongoose)

// https://github.com/Mockgoose/Mockgoose/issues/6

var Mongoose = require('mongoose').Mongoose;
var mongoose = new Mongoose();

// to suppress deprecation warnings
mongoose.set('useNewUrlParser', true);
mongoose.set('useUnifiedTopology', true);

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
                return mongoose.connect('mongodb://example.com:27017/TestingDB')
            })
            .then(function() {
                var schema = new mongoose.Schema({
                    drink:  {
                        type: 'string',
                        required: [ true, 'missing drink' ]
                    },
                    cost: {
                        type: 'string',
                        required: [ true, 'missing cost' ]
                    }
                });
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
    it('post order error', function(done) {
        const newOrder = { order: { drinky: 'mocha', costy: '4.40' } }
        api.post('/test').send(newOrder).end(function(err, res) {
            expect(res.statusCode).to.be(400)
            // map the mongoose to api error schema
            expect(res.body.errors.drink.message).to.contain('missing drink')
            done()
        })
    })
    it('post order', function(done) {
        const newOrder = { order: { drink: 'mocha', cost: '4.40' } }
        api.post('/test').send(newOrder).end(function(err, res) {
            expect(res.statusCode).to.be(201)
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

