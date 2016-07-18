var express = require('express');

var app = express();

app.post('/orders', function(req, res) {
    res.status(201);
    res.send({ order: { id: 1, drink: 'latte' }});
});

app.listen(8001);
