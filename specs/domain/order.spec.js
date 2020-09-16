var expect = require('expect.js')
var request = require('supertest')
const fakeDao = require('./fake-dao')

module.exports = function order() {

    describe('orders', function () {
        var app = require('../../server/store-app')(fakeDao);
        var api = request(app);
        describe('entity', function () {
            describe('post', function () {
                describe('error when', function () {
                    it('empty body', function (done) {
                        api.post('/orders').end(function (err, res) {
                            expect(err).to.equal(null);
                            expect(res.status).to.equal(400)
                            expect(res.body.error).to.contain('empty request body')
                            done()
                        });
                    })
                    it('no order object', function (done) {
                        api.post('/orders').send({}).end(function (err, res) {
                            expect(err).to.equal(null);
                            expect(res.status).to.equal(400)
                            expect(res.body.error).to.contain('missing order object')
                            done()
                        });
                    })
                    it('no drink object', function (done) {
                        api.post('/orders').send({order: {}}).end(function (err, res) {
                            expect(err).to.equal(null);
                            expect(res.status).to.equal(400)
                            expect(res.body.error).to.contain('missing drink object')
                            done()
                        });
                    })
                })
                describe('a latte', function () {
                    var res
                    beforeEach(function (done) {
                        api.post('/orders').send({order: {drink: 'latte'}}).end(function (err, response) {
                            res = response
                            done()
                        })
                    })
                    it('status 201', function () {
                        expect(res.status).to.equal(201)
                    })
                    describe('response', function () {
                        it('has drink', function () {
                            expect(res.body.order.drink).to.equal('latte')
                        })
                        it('has cost', function () {
                            expect(res.body.order.cost).to.equal('3.00')
                        })
                    })
                    describe('hypermedia link', function () {
                        it('for self', function () {
                            expect(res.body.order.links.self.uri).to.equal('/orders/1234')
                        })
                        it('for payment', function () {
                            expect(res.body.order.links.payment.uri).to.equal('/payment/order/1234')
                        })
                    })
                    describe('headers', () => {
                        it('location', () => {
                            // req.protocol + req.host
                            expect(res.get('location')).to.equal('http://' + res.request.host + '/orders/1234')
                        })
                    })
                })
            })
            describe('options', function () {
                describe('error when', function () {
                    it('order not found', function (done) {
                        api.options('/orders/7').end(function (err, res) {
                            expect(err).to.equal(null);
                            expect(res.status).to.equal(404)
                            expect(res.body.error).to.contain('no such order')
                            done()
                        });
                    })
                })
                describe('modifiable', function () {
                    it('allows put', function (done) {
                        api.options('/orders/6').end(function (err, res) {
                            expect(err).to.equal(null);
                            expect(res.status).to.equal(200)
                            expect(res.headers).to.have.key('allow');
                            expect(res.headers['allow']).to.equal('GET, PUT');
                            done()
                        });

                    })
                })
                describe('not modifiable', function () {
                    it('disallows put', function (done) {
                        api.options('/orders/5').end(function (err, res) {
                            expect(res.status).to.equal(200)
                            expect(res.headers).to.have.key('allow');
                            expect(res.headers['allow']).to.equal('GET');
                            done()
                        });
                    })
                })
            })
            describe('put', function () {
                // although the guide indicated optionally doing a "trial" put with Expect: 100-Continue, we'll defer that
                describe('error when', function () {
                    it('no body', function (done) {
                        api.put('/orders/1').end(function (err, res) {
                            expect(res.status).to.equal(400);
                            expect(res.body.error).to.contain('empty request body');
                            done();
                        });
                    })
                    it('no order object', function (done) {
                        api.put('/orders/1').send({}).end(function (err, res) {
                            expect(res.status).to.equal(400);
                            expect(res.body.error).to.contain('missing order object');
                            done();
                        });
                    })
                    it('invalid update data', function (done) {
                        api.put('/orders/1').send({order: {foobar: 'toast'}}).end(function (err, res) {
                            expect(res.status).to.equal(400);
                            expect(res.body.error).to.contain('invalid update');
                            done();
                        });
                    })
                })
                describe('additions shot', function () {
                    describe('error when', function () {
                        it('order already completed', function (done) {
                            var partialOrder = {order: {additions: 'tor'}};
                            api.put('/orders/2').send(partialOrder).end(function (err, res) {
                                expect(res.status).to.equal(409);
                                expect(res.body.error).to.contain('order already completed');
                                done();
                            });
                        })
                    })
                    it('success', function (done) {
                        var partialOrder = {order: {additions: 'tor'}};
                        api.put('/orders/1').send(partialOrder).end(function (err, res) {
                            expect(res.status).to.equal(200);
                            expect(res.body.order.additions).to.equal('tor');
                            done();
                        });
                    })
                    describe('response', function () {
                        var res
                        beforeEach(function (done) {
                            const partialOrder = {order: {additions: 'tor'}};
                            api.put('/orders/1').send(partialOrder).end(function (err, response) {
                                res = response
                                done()
                            })
                        })
                        it('has addition', function () {
                            expect(res.body.order.additions).to.equal('tor');
                        })
                        it('has updated price', function () {
                            expect(res.body.order.price).to.be('4.00')
                        })
                        it('has drink', function () {
                            expect(res.body.order.drink).to.be('latte')
                        })
                    })
                })
                describe('status preparing', function () {
                    describe('error when', function () {
                        it('invalid status', function (done) {
                            api.put('/orders/1').send({order: {status: 'xxxx'}}).end(function (err, res) {
                                expect(res.status).to.equal(400)
                                expect(res.body.error).to.contain('invalid order status')
                                done()
                            })
                        })

                    })
                    describe('response', function () {
                        var res
                        beforeEach(function (done) {
                            const orderUpdate = {order: {status: 'preparing'}}
                            api.put('/orders/1').send(orderUpdate).end(function (err, response) {
                                res = response
                                done()
                            })
                        })
                        it('status', function () {
                            expect(res.body.order.status).to.equal('preparing')
                        })
                    })
                })
            })
            describe('get', () => {
                describe('error when', () => {
                    var res
                    describe('invalid request', () => {
                        beforeEach((done) => {
                            api.get('/orders/=').then((_res) => {
                                res = _res
                                done()
                            })
                        })
                        it('http status', () => {
                            expect(res.statusCode).to.equal(400)
                        })
                    })
                    describe('not found', () => {
                        beforeEach((done) => {
                            api.get('/orders/1').then((_res) => {
                                res = _res
                                done()
                            })
                        })
                        it('http status', () => {
                            expect(res.statusCode).to.equal(404)
                        })
                    })
                })
                describe('pending', () => {
                    let res
                    beforeEach((done) => {
                        api.get('/orders/2').then((_res) => {
                            res = _res
                            done()
                        })
                    })
                    it('status code', () => {
                        expect(res.statusCode).to.equal(200)
                    })
                    describe('value', () => {

                    })
                    describe('hyperlinks', () => {
                        it('preset', () => {
                            expect(res.body.order).to.have.property('links')
                        })
                        it('has self', () => {
                            expect(res.body.order.links.self.uri).to.equal('/orders/1234')
                        })
                        it('has payment', () => {
                            expect(res.body.order.links.payment.uri).to.equal('/payment/order/1234')
                        })
                    })
                })
                describe('completed', () => {
                    describe('value', () => {

                    })
                    describe('hyperlink', () => {

                    })

                })
            })
        })
        describe('collection', function () {
            var res
            describe('default content type', () => {
                it('application/json', (done) => {
                    api.get('/orders').set('Accept', '*/*')
                        .end(function (err, response) {
                            expect(response.type).to.equal('application/json')
                            done()
                        })
                })
            })
            beforeEach((done) => {
                api.get('/orders').set('Accept', 'application/json').end(function (err, response) {
                    res = response
                    done()
                })
            })
            it('status code', () => {
                expect(res.statusCode).to.equal(200)
            })
            describe('result', () => {
                it('many', () => {
                    expect(res.body.orders.length).to.equal(2)
                })
                describe('links', () => {
                    let order
                    beforeEach(() => {
                        order = res.body.orders[0]
                    })
                    it('present', () => {
                        expect(order).to.have.property('links')
                    })
                    it('self', () => {
                        expect(order.links.self.uri).to.equal('/orders/1')
                    })
                })
            })
        })
    })
}
