module.exports = function(mongoose) {
    const express = require('express')
    const app = express()
    app.use(require('body-parser').json())

    app.get('/test', function(req, res) {
        var Tank = mongoose.model('Tank')
        Tank.find({ }, 'name size', function(err, tasks) {
            res.status(200)
            res.send(tasks)
        })
    })
    return app
}
