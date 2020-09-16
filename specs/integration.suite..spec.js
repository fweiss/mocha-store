const suites = [
    require('./integration/store.spec.js'),
]

describe('integration', () => {
    suites.forEach((suite) => { suite() })
})
