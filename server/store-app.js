module.exports = function() {
    var express = require('express');
    var app = express();
    var _ = require('underscore');

    var host = 'http://localhost:8001';

    app.use(require('body-parser').json())

    function sendErrorStatusMessage(res, status, message) {
        res.status(status)
        res.send({error: message})
    }

    app.post('/orders', function(req, res) {
        if (req.headers['content-length'] == 0) {
            sendErrorStatusMessage(res, 400, 'no data')
        } else if (_.isUndefined(req.body.order)) {
            sendErrorStatusMessage(res, 400, 'missing order object')
        } else if (_.isUndefined(req.body.order.drink)) {
            sendErrorStatusMessage(res, 400, 'missing drink object')
        } else {
            res.status(201)
            res.send({order: { drink: 'latte', cost: '3.00', links: { payment: { uri: '/payment/order/1234' } } } })
        }
    })

    app.options('/orders/:orderId', function(req, res) {
        if (req.params.orderId == 7) {
            sendErrorStatusMessage(res, 404, 'no such order')
        } else {
            const orderOptions = req.params.orderId == 6 ? 'GET, PUT' : 'GET'
            res.status(200)
            res.set('Allow', orderOptions)
            res.send()
        }
    })
    app.put('/orders/:orderId', function(req, res) {
        res.status(200)
        res.send({ order: { additions: 'tor' } })
    })

    return app;
};
