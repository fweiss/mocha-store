module.exports = function(mongoose) {
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
                res.status(500)
                res.send(err)
            }
            res.status(201)
            res.send(order)
        })
    })
    return app
}
