var expect = require('expect.js')
var request = require('supertest')
const schemas = require('../../server/schemas')

var Mongoose = require('mongoose').Mongoose;
var mongoose = new Mongoose();

const { MongoMemoryServer } = require('mongodb-memory-server');

const dao = require('../../server/mongoose-dao.js')

describe('store', function() {
    const app = require('../../server/store-app.js')(dao)
    var api = request(app);
    var Order
    var americanoId

    before(async () => {
        mongoServer = new MongoMemoryServer()
        const mongoUri = await mongoServer.getUri()
        await dao.connect(mongoose, mongoUri)
            .then(async () => {
                Order = await mongoose.model('Order')
            })
    })
    after(async () => {
        await mongoose.disconnect()
        await mongoServer.stop()
    })

    // create a fresh documents test fixture for each test
    beforeEach(function(done) {
        mongoose.connections[0].dropDatabase().then(() => {
            var orderLatte = new Order({ drink: 'americano', cost: '2.40'})
            orderLatte.save(function() {
                americanoId = orderLatte._id
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
    describe('payment', () => {
        it('accepts', (done) => {
            let payment = { payment: { cardNumber: '1234', cardholderName: 'John Doe', expirationDate: '0221', amount: '4.00' } }
            api.put('/payment/order/' + americanoId.toString()).send(payment).then((res) => {
                expect(res.status).to.equal(201)
                done()
            })
        })
    })
 })

