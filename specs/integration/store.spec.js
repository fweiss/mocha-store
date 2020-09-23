var expect = require('expect.js')
var request = require('supertest')
const schemas = require('../../server/schemas')

var Mongoose = require('mongoose').Mongoose;
var mongoose = new Mongoose();

const { MongoMemoryServer } = require('mongodb-memory-server');

const dao = require('../../server/mongoose-dao.js')
const app = require('../../server/store-app.js')(dao)
var api = request(app);

// helper function to test error responce for invalid docuement id
function describeInvalidId(method, path, content) {
    describe('invalid id', () => {
        let res
        before((done) => {
            api[method](path).send(content).then(($res) => {
                res = $res
                done()
            })
        })
        it('http status', () => {
            expect(res.statusCode).to.equal(400)
        })
        it('error message', () => {
            expect(res.body.error).to.contain('must be a single String')
            expect(res.body.error).to.contain('12 bytes')
            expect(res.body.error).to.contain('24 hex characters')
        })
    })
}

let Order

// helper to initialize db with the given order models
// and return the respective document ids
async function dataFixture(models) {
    return mongoose.connections[0].dropDatabase()
        .then(() => {
            return Order.insertMany(models)
        })
        .then((docs) => {
            let ids = {}
            for (let model of docs) {
                ids[model._doc.drink] = model._doc._id
            }
            return ids
        })
}

module.exports = function store() {

    describe('store', function () {
        // const app = require('../../server/store-app.js')(dao)
        // var api = request(app);
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

        describe('orders', () => {
            const nonexistingOrderId = '123456789012345678901234'

            describe('post', () => {
                const newOrder = {order: {drink: 'mocha', cost: '4.40'}}
                var id
                var resOrder
                let res
                beforeEach((done) => {
                    api.post('/orders').send(newOrder).end(function (err, $res) {
                        res = $res
                        resOrder = res.body.order
                        id = res.body.order._id
                        done()
                    })
                })
                it('http status', () => {
                    expect(res.statusCode).to.be(201)
                })
                it('confirm drink', (done) => {
                    Order.find({_id: id}, 'drink cost').then(function (orders) {
                        expect(orders.length).to.be(1)
                        expect(orders[0].drink).to.be('mocha')
                        done()
                    }).catch(function (err) {
                        done(err)
                    })
                })
                it("hyperlinks present", () => {
                    expect(resOrder).to.have.property('links')
                })
            })
            describe('put', () => {
                let res
                let ids = { }
                before( async () => {
                    ids = await dataFixture([
                        { drink: 'latte', cost: '3.30', additions: '', status: 'PENDING' },
                        { drink: 'mocha', cost: '4.30', additions: 'nut', status: 'PENDING' },
                        { drink: 'americano', cost: '2.30', additions: '', status: 'COMPLETED' },
                    ])
                })
                describe('error when', () => {

                })
                describe('pending no additions', () => {
                    let update = { order: { additions: 'low' } }
                    before((done) => {
                        api.put('/orders/' + ids.latte.toString()).send(update).then(($res) => {
                            res = $res
                            done()
                        })
                    })
                    it('http status', () => {
                        expect(res.statusCode).to.equal(200)
                    })
                    describe('update', () => {
                        let order
                        before( (done) => {
                            // let query = await Order.findById(ids.latte)
                            // done()
                            Order.findById(ids.latte, (error, $order) => {
                                order = $order
                                done()
                            })
                        })
                        it('has addition', () => {
                            expect(order.additions).to.equal('low')
                        })
                    })
                })
                describe('pending more additions', () => {
                    let id
                    let res
                    let additions = { order: { additions: 'low tir cin' } }
                    before(() => {
                        id = ids.mocha
                    })
                    before(async () => {
                        res = await api.put('/orders/' + id.toString()).send(additions)
                    })
                    it('http status', () => {
                        expect(res.statusCode).to.equal(200)
                    })
                    describe('update', () => {
                        let query
                        before(async () => {
                            query = await Order.findById(id)
                        })
                        it('has more additions', () => {
                            expect(query._doc.additions).to.equal('low tir cin')
                        })
                    })
                })
                describe('completed', () => {
                    let addition = { order: { additions: 'tor' }}
                    let id
                    let res
                    before(() => { id = ids.americano })
                    before(async () => {
                        res = await api.put('/orders/' + id.toString()).send(addition)
                    })
                    it('http status', () => {
                        expect(res.statusCode).to.equal(409)
                    })
                    it('error message', () => {
                        // expect(res.body.error).to.contain('illegal state')
                        expect(res.body.error).to.contain('order is completed')
                    })
                })
                describe('non existing', () => {
                    let id = '123456789012345678901234'
                    let additions = { order: { additions: 'tor' } }
                    let res
                    before(async () => {
                        res = await api.put('/orders/' + id).send(additions)
                    })
                    it('http status', () => {
                        expect(res.statusCode).to.equal(404)
                    })
                })
                // describeInvalidId('put', '/orders/' + '99', 'put')
             })
            describe('get collection', () => {
                let order
                let res
                let ids = {}
                before(async () => {
                    ids = await dataFixture([
                        { drink: 'americano', cost: '2.40', additions: '', status: 'PENDING' },
                    ])
                })
                beforeEach((done) => {
                    api.get('/orders').end(function (err, $res) {
                        res = $res
                        order = res.body.orders[0]
                        done()
                    })
                })
                it('http status', () => {
                    expect(res.statusCode).to.equal(200)
                })
                it('response data', () => {
                    expect(res.body.orders.length).to.be(1)
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
                describe('existing', () => {
                    let res
                    let ids = {}
                    before(async() => {
                        ids = await dataFixture([
                            { drink: 'latte', cost: '3.30', additions: '', status: 'PENDING' },
                        ])
                    })
                    beforeEach((done) => {
                        api.get('/orders/' + ids.latte.toString()).then(($res) => {
                            res = $res
                            expect(res.statusCode).to.equal(200)
                            expect(res.body).to.have.property('order')
                            done()
                        })
                    })
                    it('http status', () => {
                        expect(res.statusCode).to.equal(200)
                    })
                    describe('hyperlinks', () => {
                        it('present', () => {
                            expect(res.body.order).to.have.property('links')
                        })
                        it('have order id', () => {
                            expect(res.body.order.links.self.uri).to.contain(ids.latte.toString())
                        })
                    })
                })
                describe('non existing', () => {
                    let res
                    beforeEach((done) => {
                        api.get('/orders/' + nonexistingOrderId).then(($res) => {
                            res = $res
                            done()
                        })
                    })
                    it('http status', () => {
                        expect(res.statusCode).to.equal(404)
                    })
                })
                describeInvalidId('get', '/orders/' + '99')
             })
            // fixme A lot of error scenarios are being checked here and duplicated
            // in domain/order.spec. The plan was to do this in the domain suites, but
            // then there's a lot of fake-dao code. That's not only duplicate code, but code
            // that may give false negatives, that is, pass in domain, but not in integration
            // or acceptance.
            // The issue appears to be that there's
            // more logic in the mongoos-da than originally expected. For example, the deleteOrder
            // method i the dao is now responsible for both checking for valid id encapsulation
            // and checking the query for zero deleted documents.
            // So now we have to wonder what the domain suites should be testing.
            describe('delete', () => {
                let orderId
                before(async () => {
                    ids = await dataFixture([
                        { drink: 'latte', cost: '4.30' }
                    ])
                    orderId = ids.latte
                })
                describe('existing', () => {
                    let res
                    before((done) => {
                        api.delete('/orders/' + orderId.toString()).then(($res) => {
                            res = $res
                            done()
                        })
                    })
                    it('http status', () => {
                        expect(res.statusCode).to.equal(204)
                    })
                    it('removed', (done) => {
                        Order.find({_id: orderId}).then(function (orders) {
                            expect(orders.length).to.be(0)
                            done()
                        }).catch(function (err) {
                            done(err)
                        })
                    })
                })
                describe('non existing', () => {
                    let res
                    before((done) => {
                        api.delete('/orders/' + nonexistingOrderId).then(($res) => {
                            res = $res
                            done()
                        })
                    })
                    it('http status', () => {
                        expect(res.statusCode).to.equal(404)
                    })
                })
                describeInvalidId('delete', '/orders/99')
            })
        })
        describe('payment', () => {
            it('accepts', (done) => {
                let payment = {
                    payment: {
                        cardNumber: '1234',
                        cardholderName: 'John Doe',
                        expirationDate: '0221',
                        amount: '4.00'
                    }
                }
                api.put('/payment/order/' + '22').send(payment).then((res) => {
                    expect(res.status).to.equal(201)
                    done()
                })
            })
        })
    })
}
