# Mocha Store

Use the following example coffee store to explore hypermedia as the engine of state using TDD.

https://www.infoq.com/articles/webber-rest-workflow

## TDD for REST API
Can TDD be used to develop a REST API? 

### Test tooling
For the testing framework, the following are used:
- Mocha: a NodeJS/Jasmine test runner
- ExpectJS: expectation/assertions library
- Supertest: a mock HTTP client for server-less testing of express apps

IntelliJ is used as the IDE of choice. This also integrates the Mocha runner and provides a test reporter.

### Running mocha test in IntelliJ
Run > Edit Configurations, click "+", select Mocha. Usually this will set up things automatically.

Run > mocha-store-test, or use the toolbar. After lauch, run from the Run console at the bottom of the window.

## Test plan
The tests were divided into the following levels:
- domain: API request interaction for each resource, collection, verb, request data validation, and response data
- integration: data persistence integration
- acceptance: test for workflow scenarios

> The term "unit test" is intentionally avoided here.
> It, along with "component test", suggests the low-level technique
> of testing on a class/method basis.
> The term "domain" testing is at a higher level which aligns with the
> semantics of the domain model.
> This is inspired by the structure of the spec report.

Guidelines:
- detailed testing at the domain level
- avoid duplicating detail tests at integration level
- use spec report to organize testing

> After developing the specs some more, it looks like some modifications to 
> the test plan are needed.
> A lot of error scenarios are being checked in the integration suite and 
> duplicated in domain/order.spec. 
> The plan was to do detailed error specs in the domain suites, but
> then there's a lot of fake-dao code. 
> That's not only duplicate code, but code that may give false positives, 
> that is, pass in domain, but not in integration or acceptance.
> The issue appears to be that there's more logic in the mongoos-dao than 
> originally expected and a tighter coupling between the service and dao
> layers with respect to exception handling.
> Clearly the service layer is responsible for turning dao execptions into
> HTTP status code and responses.
> These exceptions may be better to exercise with a fake, but then it
> comes bake to having a faithful fake that doesn't produce false positives.
> For example, the deleteOrder method in the dao is now responsible for 
> both checking for valid id encapsulation and checking the query for 
> zero deleted documents.
> Another example is in updateOrder, which needs to check the order status
> before the actual update.
> So now we have to wonder what the domain suites should be testing.
> Testing the dao layer has also be considered, but that seems to also
> introduce duplicates/overlap/sync problems as the integration
> between the service and dao layers is the principle focus of testing.

### Domain (unit) tests
For Domain tests, the focus is on testing:
- app code that routes and handles requests
- request validation
- request error handling
- response format and data
- data-dependent branching

Environment is like production except:
- synthetic http request (superagent)
- in-memory fake dao test double

### Integration tests
For integration tests, the focus is on testing:
- the mongoose DAO code in mongoose-dao.js
- cross-request data persistence

Environment is like production, except:
- in-memory mongoose database test double
- data fixtures controlled and inspectible by test code
- synthetic HTTP requests via superagent

### Acceptance tests
For the acceptance tests, the focus is on testing:
- running server
- using external user agent (Postman)
- a few complete user story scenarios

Environment like production except:
- acceptance test database separate from production database
- database can be cleared and seeded from cli

## Test spec structure
After a first false start, the following spec structure was used. The key is to use a fluent, hierarchical structure
that fits well with REST and hypermedia links.

The top divisions are by resource. For the mocha store, the resources are:
- order
- drink
- payment
- etc.

The specs for each resource are divided into two parts, following the REST pattern for a resource:
- entity
- collection

For an entity, the specs are divided by HTTP verbs as follows:
- POST
- GET
- OPTIONS
- PUT
- DELETE

Depending on the entity and the verb, there are further subdivisions to address particular aspects of a particular API request:
- request validation errors
- one or more uses cases
- response data
- hypermedia links

For a collection, the specs are divided into:
- list
- search (optional)
- pagination (optional)

Authorization is another aspect, but it has not been addressed in this example.

Here is an example of how this fluent spec structure is displayed in an IDE:

![Screenshot](/docs/fluent-spec.png?raw=true "Fluent spec resport in IntelliJ")

Example entity template:

* orders (an entity of a resoource)
  * put (one of the REST verbs)
    * error when (general request validations)
      * ... (request validation assertions)
    * succeeds (a quick smoke test)
    * addition shot (detailed use case)
      * error when (use case request validation)
        * ... (request validation assertions)
      * response (use case response assertions)
        * ... (response assertions)

Tip: continuously review the spec report to check if the tests are structured fluently. Such commits are like to be described
as "Refactor test: improve fluent structure".

### Notes
Common fluent test refactorings:

* Refactor test: better fluent structure
* Refactor test: extract fixture (there's a bit to this: in it, remove done, comment out old code except asserts)

## Hypermedia links
I have some questions about hypermedia links

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

## TDD with mongodb
The first pass of TDD used in-process API tsts of the express routes using fakes and stubs.
The design at this point reflects to API, with all the verbs, validations, and responses.
In the next pass, those fakes and stubs will be replaced with mongodb objects and possibly am in-memory test double.
Or should the db be abstracted with a DAO layer?

https://semaphoreci.com/community/tutorials/a-tdd-approach-to-building-a-todo-api-using-node-js-and-mongodb

https://github.com/mockgoose/Mockgoose

## Stories
- customer orders drink
- customer make payment

## IntelliJ notes
fix: don't use semicolom to terminate statement in new code

warning: 'unresolved variable to' for expect.js 

## Links and references

http://apieconomist.com/blog/darrel-miller-hypermedia-apis

http://intercoolerjs.org/2016/05/08/hatoeas-is-for-humans.html

Blog on hAPI, FoxyCart: https://medium.com/@lukestokes/why-your-colleagues-still-don-t-understand-hypermedia-apis-1a5a2cf82540

http://willi.am/node-mocha-supertest/

https://www.futurehosting.com/blog/will-json-feed-take-the-place-of-rss-and-atom/
