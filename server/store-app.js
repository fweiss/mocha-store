module.exports = function() {
    var express = require('express');
    var app = express();
    var _ = require('underscore');

    var host = 'http://localhost:8001';

    app.fixture = {};
    app.fixture.orders = [];

    app.use(require('body-parser').json());

    var orderTemplate = {
        id: 1,
        drink: 'latte',
        cost: 3,
        status: '',
        next: {
            rel: 'payment',
            href: host + '/payment/order/1',
            type: 'application/json'
        }
    };

    app.post('/orders', function(req, res) {
        var order = _.extend({}, orderTemplate, { drink: req.body.order.drink});
        res.status(201);
        res.send({ order: order });
    });

    app.options('/orders/1', function(req, res) {
        res.status(200);
        res.append('allow', 'GET, PUT');
        res.send({ status: 'OK' });
    });

    app.put('/orders/1', function(req, res) {
        if (! req.body.order) {
            res.status(400);
            res.send({ error: { message: 'Expected an "order" object'}});
            return;
        }
        var order = _.extend({}, orderTemplate, { additions: req.body.order.additions, status: req.body.order.status });
        res.status(200);
        res.send({ order: order });
    });
    app.options('/payments/orders/:orderId', function(req, res) {
        res.status(200);
        res.append('allow', 'GET, PUT');
        res.end('');
    });
    app.put('/payments/orders/1', function(req, res) {
        res.status(201);
        res.send({ payment: {amount: 4.40 } });
    });
    app.get('/orders', function(req, res) {
        res.send({ orders: app.fixture.orders });
    });

    return app;
};
