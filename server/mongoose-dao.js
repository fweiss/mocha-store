let { NotFoundError, InvalidParameterError, InvalidStateError } = require('./common-dao.js')

const schemas = require('../server/schemas')

var Order

function getObjectId(id) {
    try {
        return mongoose.Types.ObjectId(id)
    }
    catch (err) {
        throw new InvalidParameterError(err)
    }
}

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
        let id = getObjectId(orderId)

        let o = await Order.findById(id)
        if (o === null) {
            throw new NotFoundError('not found')
        }
        return o.toObject()
    },
    updateOrder: async (orderId, updateOrder) => {
        const id = getObjectId(orderId)

        const statusQuery = await Order.findById(id)
        if (statusQuery === null) {
            throw new NotFoundError('order not found')
        }
        if (statusQuery._doc.status === 'COMPLETED') {
            throw new InvalidStateError('order is completed')
        }
        const updateQuery = await Order.updateOne({ _id: id }, updateOrder)
        // todo check query.nModifiedß, ok, n
        return
    },
    deleteOrder: async (orderId) => {
        const id = getObjectId(orderId)

        let query = await Order.deleteOne({ _id: id})
        if (query.deletedCount === 0) {
            throw new NotFoundError('order not found')
        }
    },
}