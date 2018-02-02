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

### Test plan
The tests were divided into the following intentions:
- API request interaction for each resource, collection, verb, request data validation, and response data
- data persistence integration
- acceptance test for workflows

### Test spec structure
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

## Notes
Common fluent test refactorings:

* Refactor test: better fluent structure
* Refactor test: extract fixture (there's a bit to this: in it, remove done, comment out old code except asserts)

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

## Swagger first

Goal is to have self-contained way to edit the swagger. Explore using stub builder. Ideally do a SLT based on the swagger.

Looked at the following:

- editor.swagger.io
- swagger-editor
- swagger-editor-server
- swagger-node
- sweb

### editor.swagger.io

Great editor. Can download either JSON or YML.

Problem is it saves to Downloads/swagger. Want it to download to the project source code.

src? https://github.com/swagger-api/swagger-editor/blob/master/src/standalone/topbar/topbar.jsx

Could use editor.swagger.io, but the save workflow is clumsy. Seems that if it can be launched locally,
it ought to be able to store directly in the project. The editor would run out of node_modules. Can use
nodejs server to handle the FS interface.

editor.swagger.io
based on webpack?

OK, npm install swagger-editor --save
cd node_modules/swagger-editor
but it's a directory

Getting lost in the jungle of packages. Tried swagger-editor, but couldn't get it to run locally.

Trying plain swagger package, based an api127, with fake server.

### swagger-editor

npm install swagger-editor --save

Oh man, huge, like 100 npm packages. Also the main package is just css and js. Where's the app?

The README say to run 'npm start' but that does not work in the directory where npm install was run.
Going to the node_module directory and running 'npm start' download yet more npm packages. It starts a webserver
at :3001, but the page is only a directory listing.

Hmm, the 'swagger-editor' npm package appears to be a bundled up development environment. I'm looking for just a runtime.

OK, let's try cloning and running from there. Still no joy, run 'npm start' gives directory listing.
Well, there is an index.html in the root directory and it works! That was not in the npm.

All right then, just cloning git gives an index.html ready to run, no need to build it.
The swagger-editor npm was a false start.
I'm still looking for a ready to run npm package. Maybe I'll have to build it myself.

Maybe the swagger-editor-dist package is the key. It only contains the js and css assets. Add a simple index.html
and you good to go?

#### backends

https://github.com/swagger-api/swagger-editor.git

#### swagger-editor-server

https://www.npmjs.com/package/swagger-editor-server

https://github.com/borisirota/swagger-editor-server

Sounds good, but there's no way to run it. Maybe needs to be embedded?

OK, created server.js

Opens web browser, but then "cannot GET /"

Maybe the missing piece is in your server.js, you need to statically serve swagger-editor

#### swagger-node

http://www.mohammedovich.com/2015/10/18/how-to-setup-swagger-ui-nodejs/

https://github.com/swagger-api/swagger-node

Very CLI-ish, based on yeoman.

npm install swagger -g
swagger project create ...
cd ...
swagger project edit

but uses older 2.10.5,

#### sweb

https://github.com/zgiber/sweb

Runs on Go

## IntelliJ notes
fix: don't use semicolom to terminate statement in new code

warning: 'unresolved variable to' for expect.js 

## Links and references

http://apieconomist.com/blog/darrel-miller-hypermedia-apis

http://intercoolerjs.org/2016/05/08/hatoeas-is-for-humans.html

Blog on hAPI, FoxyCart: https://medium.com/@lukestokes/why-your-colleagues-still-don-t-understand-hypermedia-apis-1a5a2cf82540

http://willi.am/node-mocha-supertest/
