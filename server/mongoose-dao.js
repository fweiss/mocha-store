let { NotFoundError, InvalidParameterError} = require('./common-dao.js')

const schemas = require('../server/schemas')

var Order

module.exports = {

    connect: async (_mongoose, uri) => {
        mongoose = _mongoose

        // to suppress deprecation warnings
        mongoose.set('useNewUrlParser', true)
        mongoose.set('useUnifiedTopology', true)

        await mongoose.connect(uri)
        const orderScheme = new mongoose.Schema(schemas.orderSchema)
        Order = mongoose.model('Order', orderScheme)
    },

    getOrders: async () => {
        return await Order.find({}).lean()
    },
    addOrder: async (order) => {
        order.cost = '3.33'

        const o = await Order.create(order)
        // return plain object to allow caller to decorate
        return o.toObject()
    },
    getOrder: async (orderId) => {
        let o = await Order.findById(mongoose.Types.ObjectId(orderId))
        if (o === null) {
            throw new NotFoundError('not found')
        }
        return o.toObject()
    },
    deleteOrder: async (orderId) => {
        let id
        try {
            id = mongoose.Types.ObjectId(orderId)
         }
        catch(err) {
            throw new InvalidParameterError(err)
        }
        let query = await Order.deleteOne({ _id: id})
        if (query.deletedCount === 0) {
            throw new NotFoundError('order not found')
        }
    },
}