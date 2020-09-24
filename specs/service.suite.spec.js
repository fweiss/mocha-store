const suites = [
    require('./service/order.spec.js'),
    require('./service/payment.spec'),
    require('./service/atom.spec.js'),
]

describe('service', () => {
    suites.forEach((suite) => { suite() })
})
