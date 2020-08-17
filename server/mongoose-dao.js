var Mongoose = require('mongoose').Mongoose;
var mongoose = new Mongoose();
const schemas = require('../server/schemas')

const phonyConnectUri = 'mongodb://localhost:27017/AcceptanceDB'
mongoose.connect(phonyConnectUri)

var orderScheme = new mongoose.Schema(schemas.orderSchema)
const Order = mongoose.model('Order', orderScheme)

module.exports = {

    getOrders: () => {},
    addOrder: async (order) => {
        order.cost = '3.33'

        Order.create(order)
            .then(function(data) { console.log('aaaaa' + data) })
            .catch(function(err) { console.log('eeeerr' + err)})
        return {
            entityId: 1234,
            data: {
                order: { drink: 'latte', cost: '3.00' }
            }
        }
        // var Order = mongoose.model('Order')
        // Order.create(order, function(err, order) {
        //     if (err) {
        //         // there may also be 500, non validation errors
        //         res.status(400)
        //         res.send(err)
        //         return
        //     }
        //     res.status(201)
        //     res.send(order)
        // })
        // return {}
    }

}