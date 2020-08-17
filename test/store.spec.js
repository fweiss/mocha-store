var expect = require('expect.js')
var request = require('supertest')
const schemas = require('../server/schemas')

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

describe('store', function() {
    var app = require('../server/mockgoose-test')(mongoose);
    var api = request(app);
    var Order
    // create the schema once per test suit
    before(function(done) {
        mockgoose.prepareStorage()
            .then(function () {
                const phonyConnectUri = 'mongodb://example.com:27017/TestingDB'
                return mongoose.connect(phonyConnectUri)
            })
            .then(function() {
                var orderScheme = new mongoose.Schema(schemas.orderSchema);
                Order = mongoose.model('Order', orderScheme);
            })
            .then(function() { done() })
            .catch(function(err) { done(err) })
    })
    // create a fresh documents test fixture for each test
    beforeEach(function(done) {
        mockgoose.helper.reset().then(function() {
            var orederLatte = new Order({ drink: 'latte', cost: '3.40'})
            orederLatte.save(function() {
                done()
            })
        })
    })
    describe('order', () => {
        describe('post', () => {
            const newOrder = { order: { drink: 'mocha', cost: '4.40' } }
            var id
            beforeEach((done) => {
                api.post('/test').send(newOrder).end(function(err, res) {
                    expect(res.statusCode).to.be(201)
                    id = res.body._id
                    done()
                })
            })
            it('confirm drink', (done) => {
                Order.find({ _id: id }, 'drink cost').then(function(orders) {
                    expect(orders.length).to.be(1)
                    expect(orders[0].drink).to.be('mocha')
                    done()
                }).catch(function(err) { done(err) })
            })
        })
        describe('get', () => {
            var order
            beforeEach((done) => {
                api.get('/test').end(function(err, res) {
                    expect(res.body.length).to.be(1)
                    order = res.body[0]
                    done()
                })
            })
            it('has drink', () => {
                expect(order.drink).to.eql('latte')
            })
            it('has cost', () => {
                expect(order.cost).to.be('3.40')
            })
        })
    })
 })

