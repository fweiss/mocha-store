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

    connect: async (_mongoose, uri, options) => {
        mongoose = _mongoose

        // to suppress deprecation warnings
        mongoose.set('useNewUrlParser', true)
        mongoose.set('useUnifiedTopology', true)

        mongoose.connection.on('connecting', (err) => {
            console.log('connecting')
        })
        mongoose.connection.on('connected', (err) => {
            console.log('connected')
        })
        mongoose.connection.on('error', (err) => {
            console.log('error')
        })
        mongoose.connection.on('disconnecting', (err) => {
            console.log('disconnecting')
        })
        mongoose.connection.on('disconnected', (err) => {
            console.log('disconnected')
        })

        await mongoose.connect(uri, options || {})
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
    // maybe use findOneAndUpdate()?
    updateOrder: async (orderId, updateOrder) => {
        const id = getObjectId(orderId)

        const statusQuery = await Order.findById(id)
        if (statusQuery === null) {
            throw new NotFoundError('order not found')
        }
        if (statusQuery._doc.status === 'COMPLETED') {
            throw new InvalidStateError('order is completed')
        }

        options = {
            runValidators: true
        }
        try {
            return await Order.updateOne({ _id: id }, updateOrder, options)
        }
        catch (err) {
            throw new InvalidParameterError(err)
        }
        // const updateQuery = await Order.updateOne({ _id: id }, updateOrder, options)
        // // todo check query.nModifiedß, ok, n
        // return
    },
    deleteOrder: async (orderId) => {
        const id = getObjectId(orderId)

        let query = await Order.deleteOne({ _id: id})
        if (query.deletedCount === 0) {
            throw new NotFoundError('order not found')
        }
    },
}