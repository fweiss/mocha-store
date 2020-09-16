const suites = [
    require('./domain/order.spec.js'),
    require('./domain/payment.spec'),
    require('./domain/atom.spec.js'),
]

describe('domain', () => {
    suites.forEach((suite) => { suite() })
})
