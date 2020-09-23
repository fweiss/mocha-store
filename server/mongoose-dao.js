let { NotFoundError, InvalidParameterError, InvalidStateError } = require('./common-dao.js')

const schemas = require('../server/schemas')

var Order

function getIdObject(id) {
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
        let id
        try {
            id = mongoose.Types.ObjectId(orderId)
        }
        catch (err) {
            throw new InvalidParameterError(err)
        }
        let o = await Order.findById(id)
        if (o === null) {
            throw new NotFoundError('not found')
        }
        return o.toObject()
    },
    updateOrder: async (orderId, updateOrder) => {
        const id = getIdObject(orderId)

        const query1 = await Order.findById(id)
        if (query1 === null) {
            throw new NotFoundError('order not found')
        }
        if (query1._doc.status === 'COMPLETED') {
            throw new InvalidStateError('order is completed')
        }
        const query = await Order.updateOne({ _id: id }, updateOrder)
        // todo check query.nModifiedß, ok, n
        return
    },
    deleteOrder: async (orderId) => {
        let id
        try {
            id = mongoose.Types.ObjectId(orderId)
         }
        catch (err) {
            throw new InvalidParameterError(err)
        }
        let query = await Order.deleteOne({ _id: id})
        if (query.deletedCount === 0) {
            throw new NotFoundError('order not found')
        }
    },
}