module.exports = function(mongoose) {
    const _ = require('underscore')
    const express = require('express')
    const app = express()
    app.use(require('body-parser').json())

    app.get('/test', function(req, res) {
        var Order = mongoose.model('Order')
        Order.find({ }, 'drink cost', function(err, orders) {
            res.status(200)
            res.send(orders)
        })
    })
    app.post('/test', function(req, res) {
        var Order = mongoose.model('Order')
        Order.create(req.body.order, function(err, order) {
            if (err) {
                // there may also be 500, non validation errors
                res.status(400)
                res.send(err)
                return
            }
            res.status(201)
            res.send(order)
        })
    })
    return app
}
