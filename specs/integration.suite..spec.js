const suites = [
    require('./integration/store.spec.js'),
]

describe('integration', () => {
    for(let suite of suites) {
        suite()
    }
})
