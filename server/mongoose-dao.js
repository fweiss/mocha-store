// var Mongoose = require('mongoose').Mongoose;
// var mongoose = new Mongoose();

const schemas = require('../server/schemas')

// const phonyConnectUri = 'mongodb://localhost:27017/AcceptanceDB'
// mongoose.connect(phonyConnectUri)

var Order

module.exports = {

    connect: (_mongoose, uri) => {
        mongoose = _mongoose

        // to suppress deprecation warnings
        mongoose.set('useNewUrlParser', true)
        mongoose.set('useUnifiedTopology', true)

        mongoose.connect(uri)
        const orderScheme = new mongoose.Schema(schemas.orderSchema)
        Order = mongoose.model('Order', orderScheme)
    },

    getOrders: async () => {
        return await Order.find({})
    },
    addOrder: async (order) => {
        order.cost = '3.33'

        return await Order.create(order)
            // .then(function(data) {
            //     return {
            //         entityId: 1234,
            //         data: {
            //             order: { drink: 'latte', cost: '3.00' }
            //         }
            //     }
            // })
            // .catch(function(err) { console.log('eeeerr' + err)})


        // return {
        //     entityId: 1234,
        //     data: {
        //         order: { drink: 'latte', cost: '3.00' }
        //     }
        // }
    }

}