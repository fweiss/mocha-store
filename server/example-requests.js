module.exports = {
    examples: {
        orders: {
            put: {
                order: {
                    additions: 'shot'
                }
            }
        },
        payment: {
            put: { payment: { cardNumber: '123', expirationDate: '20180201', cardholderName: 'John Doe', amount: '4.40' } }
        }
    }
}
