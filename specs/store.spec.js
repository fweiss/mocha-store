var expect = require('expect.js')
var request = require('supertest')
const schemas = require('../server/schemas')

var Mongoose = require('mongoose').Mongoose;
var mongoose = new Mongoose();

var Mockgoose = require('mockgoose').Mockgoose;
var mockgoose = new Mockgoose(mongoose);

const dao = require('../server/mongoose-dao.js')

describe('store', function() {
    // var app = require('../server/mockgoose-test')(mongoose);

    // dao.connect(mongoose, 'mongodb://localhost:27017/TestDB')
    const app = require('../server/store-app.js')(dao)
    var api = request(app);
    var Order
    var americanoId
    // create the schema once per test suit
    before(function(done) {
        mockgoose.prepareStorage()
            .then(function () {
                dao.connect(mongoose, 'mongodb://localhost:27017/TestDB')
            })
            .then(function() {
                // var orderScheme = new mongoose.Schema(schemas.orderSchema);
                Order = mongoose.model('Order');
            })
            .then(function() { done() })
            .catch(function(err) { done(err) })
    })
    // create a fresh documents test fixture for each test
    beforeEach(function(done) {
        const c = mongoose.connections
        mockgoose.helper.reset().then(function() {
            var orederLatte = new Order({ drink: 'americano', cost: '2.40'})
            orederLatte.save(function() {
                americanoId = orederLatte._id
                done()
            })
        })
    })
    describe('orders', () => {
        describe('post', () => {
            const newOrder = { order: { drink: 'mocha', cost: '4.40' } }
            var id
            var resOrder
            beforeEach((done) => {
                api.post('/orders').send(newOrder).end(function(err, res) {
                    expect(res.statusCode).to.be(201)
                    resOrder = res.body.order
                    id = res.body.order._id
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
            it("hyperlinks present", () => {
                expect(resOrder).to.have.property('links')
            })
        })
        describe('get collection', () => {
            var order
            beforeEach((done) => {
                api.get('/orders').end(function(err, res) {
                    expect(res.statusCode).to.equal(200)
                    expect(res.body.orders.length).to.be(1)
                    order = res.body.orders[0]
                    done()
                })
            })
            describe('an order', () => {
                it('has drink', () => {
                    expect(order.drink).to.eql('americano')
                })
                it('has cost', () => {
                    expect(order.cost).to.be('2.40')
                })
                describe('hyperlinks', () => {
                    it('present', () => {
                        expect(order).to.have.property('links')
                    })
                })
            })
        })
        describe('get entity', () => {
            let res
            beforeEach((done) => {
                api.get('/orders/' + americanoId).then((_res) => {
                    res = _res
                    expect(res.statusCode).to.equal(200)
                    expect(res.body).to.have.property('order')
                    done()
                })
            })
            it('status', () =>{
                expect(res.statusCode).to.equal(200)
            })
            describe('hyperlinks', () => {
                it('present', () => {
                    expect(res.body.order).to.have.property('links')
                })
                it('have order id', () => {
                    expect(res.body.order.links.self.uri).to.contain(americanoId.toString())
                })
            })
         })
    })
 })

