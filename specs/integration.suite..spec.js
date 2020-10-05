const suites = [
    require('./integration/store.spec.js'),
    require('./integration/connection.spec.js'),
]

describe('integration', () => {
    suites.forEach((suite) => { suite() })
})
