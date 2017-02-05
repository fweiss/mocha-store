var express = require('express');
var app = express();
var _ = require('underscore');

var host = 'http://localhost:8001';

app.use(require('body-parser').json());

var orderTemplate = {
    id : 1,
    drink: 'latte',
    cost: 3,
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
    var order = _.extend({}, orderTemplate, { additions: req.body.order.additions });
    res.status(200);
    res.send({ order: order });
});

app.listen(8001);
