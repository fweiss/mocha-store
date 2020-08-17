var Mongoose = require('mongoose').Mongoose;
var mongoose = new Mongoose();

// to suppress deprecation warnings
mongoose.set('useNewUrlParser', true);
mongoose.set('useUnifiedTopology', true);

const schemas = require('../server/schemas')

const phonyConnectUri = 'mongodb://localhost:27017/AcceptanceDB'
mongoose.connect(phonyConnectUri)

var orderScheme = new mongoose.Schema(schemas.orderSchema)
const Order = mongoose.model('Order', orderScheme)

module.exports = {

    mongoose: mongoose,

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