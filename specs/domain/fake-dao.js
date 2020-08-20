// this 'fake' store dao return pre-canned responses
// it's useful for testing error conditions without having to create mockgoose
// data fixtures
// The api must match mongoose-dao for substitution via injection in the
// e2e and production servers
// note that since mongoose/mongo uses promises, this dao must follow suite,
// using the ES6 async/await language support for promises

// const NotFoundError = require('../server/common-dao.js')
// const InvalidParameterError = require('../server/common-dao.js')

let { NotFoundError, InvalidParameterError} = require('../../server/common-dao.js')

module.exports = {

    getOrders: async function() {
        // return {
        //     orders: [
        //         { _id: '1', drink: 'latte', cost: '3.00' },
        //         { _id: '2', drink: 'mocha', cost: '4.00' }
        //     ]
        // }
        return [
                { _id: '1', drink: 'latte', cost: '3.00' },
                { _id: '2', drink: 'mocha', cost: '4.00' }
            ]

    },
    addOrder: async function(order) {
        return { _id: '1234', drink: 'latte', cost: '3.00' }
    },
    getOrder: async (orderId) => {
        if (orderId === '2') {
            return {  _id: '1234', drink: 'latte', cost: '3.00'}
        } else if (orderId === '1') {
            throw new NotFoundError('not found')
        }
        throw new InvalidParameterError('invalid parameter')

    }
}
