module.exports = function() {
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

    app.post('/orders', function(req, res) {
        if (req.headers['content-length'] === '0') {
            return sendErrorStatusMessage(res, 400, 'empty request body')
        }
        if (_.isUndefined(req.body.order)) {
            return sendErrorStatusMessage(res, 400, 'missing order object')
        }
        if (_.isUndefined(req.body.order.drink)) {
            return sendErrorStatusMessage(res, 400, 'missing drink object')
        }
        res.status(201)
        res.send({order: { drink: 'latte', cost: '3.00', links: { payment: { uri: '/payment/order/1234' } } } })
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
        if (_.isUndefined(req.body.order.additions)) {
            return sendErrorStatusMessage(res, 400, 'invalid update')
        }
        if (req.params.orderId === '2') {
            return sendErrorStatusMessage(res, 409, 'order already completed')
        }
        var updatedOrder = _.extend({ price: '4.00' }, defaultOrder, req.body.order)
        res.status(200)
        res.send({ order:  updatedOrder })
    })
    app.get('/orders', function(req, res) {
        res.status(200)
        res.set('content-type', 'application/atom+xml')
        res.send('<feed xmlns="http://www.w3.org/2005/Atom">')
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

    return app;
};
