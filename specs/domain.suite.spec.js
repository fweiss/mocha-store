const suites = [
    require('./domain/order.spec.js'),
    require('./domain/payment.spec'),
    require('./domain/atom.spec.js'),
]

describe('domain', () => {
    for(let suite of suites) {
        suite()
    }
})
