let { NotFoundError, InvalidParameterError, InvalidStateError } = require('./common-dao.js')

module.exports = function(dao) {

    if (dao === undefined) {
        throw new Error('server failed: invalid dao')
    }
    var express = require('express');
    var app = express();
    var _ = require('underscore');

    const examples = require('./example-requests.js').examples

    var host = 'http://localhost:8001';

    app.use(require('body-parser').json())

    function sendErrorStatusMessage(res, status, message, $examples) {
        res.status(status)
        let response = { error: message }
        if ($examples) {
            response.examples = $examples
        }
        res.send(response)
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
        res.location(req.protocol + '://' + req.hostname + ':' + req.connection.localPort + '/orders/' + result._id)
        res.status(201)
        res.send(response)
    })
    app.get('/orders/:orderId', async function(req, res) {
        try {
            let result = await dao.getOrder(req.params.orderId)
            let response = { order: result }
            response.order.links = {
                self: { uri: '/orders/' + result._id },
                payment: { uri: '/payment/order/' + result._id }
            }
            res.status(200)
            res.send(response)
        }
        catch (err) {
            res.status(500)
            if (err instanceof InvalidParameterError) {
                res.status(400)
            } else if (err instanceof NotFoundError) {
                res.status(404)
            }
            // res.send('order error' + err)
            res.send({ error: err.message})
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
    app.put('/orders/:orderId', async function(req, res) {
        const $examples = examples.orders.put
        if (req.headers['content-length'] === '0') {
            return sendErrorStatusMessage(res, 400, 'empty request body', $examples)
        }
        if (_.isUndefined(req.body.order)) {
            return sendErrorStatusMessage(res, 400, 'missing order object', $examples)
        }
        const validKeys = [ 'additions', 'status' ]
        if (_.isEmpty(_.intersection(_.keys(req.body.order), validKeys))) {
        // if (_.isUndefined(req.body.order.additions)) {
            return sendErrorStatusMessage(res, 400, 'invalid update', $examples)
        }

        try {
            const result = await dao.updateOrder(req.params.orderId, req.body.order)
            res.status(200)
            res.send(result)
        }
        catch (err) {
            res.status(500)
            if (err instanceof NotFoundError) {
                res.status(404)
            }
            if (err instanceof InvalidStateError) {
                res.status(409)
            }
            if (err instanceof InvalidParameterError) {
                res.status(400)
            }
            res.send({error: err.message})
        }
    })
    app.delete('/orders/:orderId', async (req, res) => {
        try {
            await dao.deleteOrder(req.params.orderId)
            res.status(204)
            res.send()
        }
        catch(err) {
            if (err instanceof InvalidParameterError) {
                res.status(400)
            } else if (err instanceof NotFoundError) {
                res.status(404)
            }
            res.send({ error: err.message })
        }
    })
    app.get('/orders', async (req, res) => {
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

    app.options('/payment/orders/:orderId', function(req, res) {
        if (req.params.orderId === '7') {
            return sendErrorStatusMessage(res, 404, 'no such order')
        }
        const paymentOptions = req.params.orderId === '6' ? 'GET, PUT' : 'GET'
        res.status(200)
        res.set('Allow', paymentOptions)
        res.send()
    })
    app.put('/payment/order/:orderid', function(req, res) {
        const ex = examples.payment.put
        if (req.headers['content-length'] === '0') {
            return sendErrorStatusMessage(res, 400, 'no request body', ex)
        }
        if (_.isUndefined(req.body.payment)) {
            return sendErrorStatusMessage(res, 400, 'no payment object', ex)
        }
        if (_.isUndefined(req.body.payment.cardNumber)) {
            return sendErrorStatusMessage(res, 400, 'no card number', ex)
        }
        if (_.isUndefined(req.body.payment.expirationDate)) {
            return sendErrorStatusMessage(res, 400, 'no expiration date', ex)
        }
        if (_.isUndefined(req.body.payment.cardholderName)) {
            return sendErrorStatusMessage(res, 400, 'no cardholder name', ex)
        }
        if (_.isUndefined(req.body.payment.amount)) {
            return sendErrorStatusMessage(res, 400, 'no amount', ex)
        }
        res.status(201)
        res.send({ payment: { amount: req.body.payment.amount }})
    })

    return app;
};
