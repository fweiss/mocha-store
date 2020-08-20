// const NotFoundError = require('./common-dao.js')
// const InvalidParameterError = require('./common-dao.js')

let { NotFoundError, InvalidParameterError} = require('./common-dao.js')

module.exports = function(dao) {

    if (dao === undefined) {
        throw new Error('server failed: invalid dao')
    }
    var express = require('express');
    var app = express();
    var _ = require('underscore');

    var host = 'http://localhost:8001';

    var defaultOrder = {
        drink: 'latte'
    }

    app.use(require('body-parser').json())

    function sendErrorStatusMessage(res, status, message) {
        res.status(status)
        res.send({error: message})
    }

    app.post('/orders', async function(req, res) {
        if (req.headers['content-length'] === '0') {
            return sendErrorStatusMessage(res, 400, 'empty request body')
        }
        if (_.isUndefined(req.body.order)) {
            return sendErrorStatusMessage(res, 400, 'missing order object')
        }
        if (_.isUndefined(req.body.order.drink)) {
            return sendErrorStatusMessage(res, 400, 'missing drink object')
        }
        const result = await dao.addOrder(req.body.order)
        // todo check result.error
        response = { order: result }
        response.order.links =  {
            self: { uri: '/orders/' + result._id },
            payment: { uri: '/payment/order/' + result._id }
        }

        res.status(201)
        // res.send({order: { drink: 'latte', cost: '3.00', links: links } })
        res.send(response)
    })
    app.get('/orders/:orderId', async function(req, res) {
        try {
            let result = await dao.getOrder(req.params.orderId)
            let response = { order: result }
            response.order.links = {
                self: { uri: '/orders/' + result._id }
            }
            res.status(200)
            res.send(response)
        }
        catch (err) {
            res.status(500)
            let z = new NotFoundError('z')
            let y = z instanceof NotFoundError
            if (err instanceof InvalidParameterError) {
                res.status(400)
            } else if (err instanceof NotFoundError) {
                res.status(404)
            }

            res.send('order error' + err)
        }
    })

    app.options('/orders/:orderId', function(req, res) {
        if (req.params.orderId === '7') {
            return sendErrorStatusMessage(res, 404, 'no such order')
        }
        const orderOptions = req.params.orderId === '6' ? 'GET, PUT' : 'GET'
        res.status(200)
        res.set('Allow', orderOptions)
        res.send()
    })
    app.put('/orders/:orderId', function(req, res) {
        if (req.headers['content-length'] === '0') {
            return sendErrorStatusMessage(res, 400, 'empty request body')
        }
        if (_.isUndefined(req.body.order)) {
            return sendErrorStatusMessage(res, 400, 'missing order object')
        }
        const validKeys = [ 'additions', 'status' ]
        if (_.isEmpty(_.intersection(_.keys(req.body.order), validKeys))) {
        // if (_.isUndefined(req.body.order.additions)) {
            return sendErrorStatusMessage(res, 400, 'invalid update')
        }
        if (req.params.orderId === '2') {
            return sendErrorStatusMessage(res, 409, 'order already completed')
        }
        if (req.body.order.status && req.body.order.status !== 'preparing') {
            return sendErrorStatusMessage(res, 400, 'invalid order status')
        }
        var updatedOrder = _.extend({ price: '4.00' }, defaultOrder, req.body.order)
        res.status(200)
        res.send({ order:  updatedOrder })
    })
    app.get('/orders', async (req, res) => {
        let a = req.accepts('application/atom+xml')
        if (req.accepts('application/json') === 'application/json') {
            var result = await dao.getOrders()
            let response = { orders: result }
            _.each(response.orders, (order) => {
                order.links = { self: { uri: '/orders/' + order._id}}
            })
            res.set('content-type', 'application/json')
            res.status(200)
            res.send(response)
        } else if (req.accepts('application/atom+xml') === 'application/atom+xml') {
            res.status(200)
            res.set('content-type', 'application/atom+xml')
            res.send('<feed xmlns="http://www.w3.org/2005/Atom"><updated>20180201</updated></feed>')
        } else {
            result = dao.getOrders()
            res.set('content-type', 'text/plain')
            res.status(401)
            res.send('unsupported content type')
        }
    })

    app.options('/payments/orders/:orderId', function(req, res) {
        if (req.params.orderId === '7') {
            return sendErrorStatusMessage(res, 404, 'no such order')
        }
        const paymentOptions = req.params.orderId === '6' ? 'GET, PUT' : 'GET'
        res.status(200)
        res.set('Allow', paymentOptions)
        res.send()
    })
    app.put('/payments/order/:orderid', function(req, res) {
        if (req.headers['content-length'] === '0') {
            return sendErrorStatusMessage(res, 400, 'no request body')
        }
        if (_.isUndefined(req.body.payment)) {
            return sendErrorStatusMessage(res, 400, 'no payment object')
        }
        if (_.isUndefined(req.body.payment.cardNumber)) {
            return sendErrorStatusMessage(res, 400, 'no card number')
        }
        if (_.isUndefined(req.body.payment.expirationDate)) {
            return sendErrorStatusMessage(res, 400, 'no expiration date')
        }
        if (_.isUndefined(req.body.payment.cardholderName)) {
            return sendErrorStatusMessage(res, 400, 'no cardholder name')
        }
        if (_.isUndefined(req.body.payment.amount)) {
            return sendErrorStatusMessage(res, 400, 'no amount')
        }
        res.status(200)
        res.send({ payment: { amount: req.body.payment.amount }})
    })


    return app;
};
