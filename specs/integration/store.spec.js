var expect = require('expect.js')
var request = require('supertest')
const schemas = require('../../server/schemas')

var Mongoose = require('mongoose').Mongoose;
var mongoose = new Mongoose();

const { MongoMemoryServer } = require('mongodb-memory-server');

const dao = require('../../server/mongoose-dao.js')
const app = require('../../server/store-app.js')(dao)
var api = request(app);

let Order

// reusable data fixtures
const fixtures = {
    nonexisting: {
        orderId: '123456789012345678901234'
    },
    additions: {
        simple: { order: { additions: 'tor' }},
    }
}

// helper function to test error responce for invalid docuement id
function describeInvalidId(method, path, content) {
    describe('invalid id', () => {
        let res
        before(async () => {
            res = await api[method](path).send(content)
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
function specInvalidId(method, path, content) {
    let res
    before(async () => {
        res = await api[method](path).send(content)
    })
    it('http status', () => {
        expect(res.statusCode).to.equal(400)
    })
    it('error message', () => {
        expect(res.body.error).to.contain('must be a single String')
        expect(res.body.error).to.contain('12 bytes')
        expect(res.body.error).to.contain('24 hex characters')
    })
}

// helper to initialize db with the given order models
// and return the respective document ids
async function databaseFixture(models) {
    return mongoose.connections[0].dropDatabase()
        .then(() => {
            return Order.insertMany(models)
        })
        .then((docs) => {
            // TODO we can assume the ids are returned in order
            // better to not index by drink, instead let the caller select the needed ids
            let ids = {}
            for (let model of docs) {
                ids[model._doc.drink] = model._doc._id
            }
            return ids
        })
}

module.exports = function store() {

    describe('orders', function () {
        var americanoId

        before(async () => {
            mongoServer = new MongoMemoryServer()
            let mongoUri = await mongoServer.getUri()

            let options = {
                serverSelectionTimeoutMS: 10
            }
            let connection = dao.connect(mongoose, mongoUri, options)
            connection.catch((err) => {
                console.log(err)
            })
            return connection.then(async () => {
                Order = await mongoose.model('Order')
            })
        })
        after(async () => {
            await mongoose.disconnect()
            await mongoServer.stop()
        })

        describe('post', () => {
            const newOrder = {order: {drink: 'mocha', cost: '4.40'}}
            let postId
            let res
            beforeEach(async () => {
                res = await api.post('/orders').send(newOrder)
                postId = res.body.order._id
            })
            it('http status', () => {
                expect(res.statusCode).to.be(201)
            })
            describe('response', () => {
                it('has price', () => {
                    // fixme price comes from post or db?
                    // currenlty hardwired in dao
                    expect(res.body.order.cost).to.equal('3.33')
                })
                it("hyperlinks present", () => {
                    expect(res.body.order).to.have.property('links')
                })
            })
            describe('database', () => {
                let orders
                before(async () => {
                    orders = await Order.find({_id: postId}, 'drink cost status')
                })
                it('is added', () => {
                    expect(orders.length).to.equal(1)
                })
                it('has drink', ()  => {
                    expect(orders[0].drink).to.equal('mocha')
                })
                it('has price', ()  => {
                    expect(orders[0].cost).to.equal('3.33')
                })
                it('status pending', ()  => {
                    expect(orders[0].status).to.equal('PENDING')
                })
            })
        })

        // PUT

        describe('put', () => {
            let ids = { }
            before( async () => {
                ids = await databaseFixture([
                    { drink: 'latte', cost: '3.30', additions: '', status: 'PENDING' },
                    { drink: 'mocha', cost: '4.30', additions: 'nut', status: 'PENDING' },
                    { drink: 'americano', cost: '2.30', additions: '', status: 'COMPLETED' },
                ])
            })
            describe('additions', () => {
                let res
                describe('pending', () => {
                    describe('with no additions', () => {
                        let update = { order: { additions: 'low' } }
                        before(async () => {
                            res = await api.put('/orders/' + ids.latte.toString()).send(update)
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
                    describe('with more additions', () => {
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
                })
                 describe('completed', () => {
                    let addition = fixtures.additions.simple
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
                        expect(res.body.error).to.contain('order is completed')
                    })
                })
                describe('non existing', () => {
                    let id = fixtures.nonexisting.orderId
                    let addition = fixtures.additions.simple
                    let res
                    before(async () => {
                        res = await api.put('/orders/' + id).send(addition)
                    })
                    it('http status', () => {
                        expect(res.statusCode).to.equal(404)
                    })
                })
                describe('invalid id', () => {
                    specInvalidId('put', '/orders/99', { order: { additions: 'tor' } })
                })
                // describeInvalidId('put', '/orders/' + '99', 'put')
            })
            describe('status', () => {
                // todo use non-shared data fixture
                let id
                before(() => { id = ids.mocha})
                describe('invalid', () => {
                    let res
                    before(async () => {
                        res = await api.put('/orders/' + id.toString()).send({ order: { status: 'xxx'} })
                    })
                    it('http status', async () => {
                        expect(res.statusCode).to.equal(400)
                    })
                    describe('response', () => {
                        it('error message', () => {
                            expect(res.body.error).to.contain('ValidationError')
                            // expect(res.body.error).to.contain('status: \'xxx\'')
                        })
                    })
                })
                describe('completed', () => {
                    let res
                    before(async () => {
                        res = await api.put('/orders/' + id.toString()).send({ order: { status: 'COMPLETED'} })
                    })
                    it('http status', async () => {
                        expect(res.statusCode).to.equal(200)
                    })
                    it('database', async () => {
                        let query = await Order.findById(id)
                        expect(query.toObject().status).to.equal('COMPLETED')
                    })
                })
            })
        })
        describe('get collection', () => {
            let order
            let res
            let ids = {}
            before(async () => {
                ids = await databaseFixture([
                    { drink: 'americano', cost: '2.40', additions: '', status: 'PENDING' },
                ])
            })
            beforeEach(async () => {
                res = await api.get('/orders')
                order = res.body.orders[0]
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
                    ids = await databaseFixture([
                        { drink: 'latte', cost: '3.30', additions: '', status: 'PENDING' },
                    ])
                })
                beforeEach(async () => {
                    res = await api.get('/orders/' + ids.latte.toString())
                })
                it('http status', () => {
                    expect(res.statusCode).to.equal(200)
                })
                it('response', () => {
                    expect(res.body).to.have.property('order')
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
                const id = fixtures.nonexisting.orderId
                let res
                before(async () => {
                    res = await api.get('/orders/' + id)
                })
                it('http status', () => {
                    expect(res.statusCode).to.equal(404)
                })
            })
            describeInvalidId('get', '/orders/' + '99')
        })

        // DELETE

        describe('delete', () => {
            let orderId
            before(async () => {
                ids = await databaseFixture([
                    { drink: 'latte', cost: '4.30' }
                ])
                orderId = ids.latte
            })
            describe('existing', () => {
                let res
                before(async () => {
                    res = await api.delete('/orders/' + orderId.toString())
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
                const id = fixtures.nonexisting.orderId
                let res
                before(async () => {
                    res = await api.delete('/orders/' + id)
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
}
