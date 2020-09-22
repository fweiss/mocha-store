module.exports = {
    orderSchema: {
        drink:  {
            type: 'string',
            required: [ true, 'missing drink' ],
        },
        cost: {
            type: 'string',
            required: [ true, 'missing cost' ],
        },
        status: {
            type: 'string',
            enum: [ 'PENDING', 'COMPLETED' ],
            default: 'PENDING',
        },
        additions: {
            type: 'string',
        },
    }
}