var express = require('express');

var app = express();

app.use(require('body-parser').json());

app.post('/orders', function(req, res) {
    var order = req.body.order;
    res.status(201);
    res.send({ order: { id: 1, drink: order.drink }});
});

app.listen(8001);
