module.exports = {
    orderSchema: {
        drink:  {
            type: 'string',
            required: [ true, 'missing drink' ]
        },
        cost: {
            type: 'string',
            required: [ true, 'missing cost' ]
        }
    }
}