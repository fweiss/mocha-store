module.exports = {

    getOrders: function() {
        return {
            orders: [
                { drink: 'latte', cost: '3.00' },
                { drink: 'mocha', cost: '4.00' }
            ]
        }
    },
    addOrder: function(order) {
        return {
            entityId: 1234,
            data: {
                order: { drink: 'latte', cost: '3.00' }
            }
        }
    },
}
