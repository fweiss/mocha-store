var Mongoose = require('mongoose').Mongoose;
var mongoose = new Mongoose();
const schemas = require('../server/schemas')

var orderScheme = new mongoose.Schema(schemas.orderSchema);
Order = mongoose.model('Order', orderScheme);

module.exports = {

    getOrders: () => {},
    addOrder: (order) => {
        var Order = mongoose.model('Order')
        Order.create(order, function(err, order) {
            if (err) {
                // there may also be 500, non validation errors
                res.status(400)
                res.send(err)
                return
            }
            res.status(201)
            res.send(order)
        })
        return {}}

}