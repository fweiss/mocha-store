var express = require('express');

var app = express();

app.use(require('body-parser').json());

app.post('/orders', function(req, res) {
    var order = { order:
        {
            id : 1,
            drink: req.body.order.drink,
            cost: 3
        }
    }
    res.status(201);
    res.send(order);
});

app.listen(8001);
