var express = require('express');
var app = express();

var host = 'http://localhost:8001';

app.use(require('body-parser').json());

app.post('/orders', function(req, res) {
    var order = { order:
        {
            id : 1,
            drink: req.body.order.drink,
            cost: 3,
            next: {
                rel: 'payment',
                href: host + '/payment/order/1',
                type: 'application/json'
            }
        }
    }
    res.status(201);
    res.send(order);
});

app.listen(8001);
