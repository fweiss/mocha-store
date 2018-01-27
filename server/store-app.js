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
            res.status(400)
            res.send({error: 'no data'})
        } else if (_.isUndefined(req.body.order)) {
            res.status(400)
            res.send({error: 'missing order object'})
        } else if (_.isUndefined(req.body.order.drink)) {
            sendErrorStatusMessage(res, 400, 'missing drink object')
        } else {
            res.status(201)
            res.send({ })
        }
    })

    return app;
};
