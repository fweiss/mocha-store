# Mocha Store

Use the following example coffee store to explore hypermedia as the engine of state.

https://www.infoq.com/articles/webber-rest-workflow

## Notes

### Hypermedia link (next)

The rel was given as a uri. This could point to metadata about the action. But that can become pretty
chatty if it's implemented in a smart client.

The type was given as 'application/json', but this doesn't really tell the client the schema of the domain
object that is involved in the indicated resource.

### Self-describing documents

Assuming that any API call provides sufficient hypermedia links to navigate the entire application state, there's still
the question of discovering the document types. For example, by convention, one can assume that /v1/orders would allow
a POST to create a new order. But how would the structure of the valid POST body be discovered? Certainly not by trial and error.

Zac provides an older but interesting inquiry into using OPTIONS to provide a resource's metadata: https://www.infoq.com/articles/webber-rest-workflow

An alternate, which overcomes the non-cacheability of OPTIONS, is the HEAD method: https://www.mnot.net/blog/2012/10/29/NO_OPTIONS

How about having the body of OPTIONS provide the media types by which the resource can be accessed.

## Test Frameworks

### Chai

Great library. There's an issue that's bugged many people. There are a number of assertions, such as 'exist' that rely on
ES property getters. In IntelliJ the first place I saw this was with a warning.

``expect(err).to.not.exist
Warning, Expression statement is not assignment or call``

So what are they doing? Using the getter for the exist property to throw the assertion failure! But even if that's
frowned upon, the JSLint can't tell you if ``expect(v).to.ejist`` is nonesense.

Chai likes to use this:

``expect(v).to.exist; expect(v).to.equal(); expect(v).to.be.above(5)``

but the 'to.be' is just noise. The above is just as readable (for me) as

``expect(v).toExist(), expect(v).toEqual(), expect(v).toBeGreaterThan()`` etc. In other words, camel case instead of dot chain!

### Shouldjs

Supposed to be better than chai, but relies on adding 'should' to object prototype, so still suffers from crappy
assertions on null and undefined. I want to stick with expect(v) approach.

Hmm, there are two shouldjs libraries?

### Other assert libraries

#### https://github.com/Automattic/expect.js

This one is recommended by mocha, uses expect style, dot chaining, but not getter assertions.
