// this 'fake' store dao return pre-canned responses
// it's useful for testing error conditions without having to create mockgoose
// data fixtures
// The api must match mongoose-dao for substitution via injection in the
// e2e and production servers
// note that since mongoose/mongo uses promises, this dao must follow suite,
// using the ES6 async/await language support for promises

module.exports = {

    getOrders: async function() {
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
