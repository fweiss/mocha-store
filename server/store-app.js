module.exports = function() {
    var express = require('express');
    var app = express();
    var _ = require('underscore');

    var host = 'http://localhost:8001';

    app.use(require('body-parser').json());

    app.post('/orders', function(req, res) {console.log(req.body)
        if (req.headers['content-length'] == 0) {
            res.status(400)
            res.send({error: 'no data'})
        } else if (_.isUndefined(req.body.order)) {
            res.status(400)
            res.send({error: 'missing order object'})

        } else {
            res.status(201)
            res.send({ })
        }
    })

    return app;
};
