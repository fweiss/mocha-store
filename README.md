# Mocha Store

Use the following example coffee store to explore hypermedia as the engine of state.

https://www.infoq.com/articles/webber-rest-workflow

## Notes

### Hypermedia link (next)

The rel was given as a uri. This could point to metadata about the action. But that can become pretty
chatty if it's implemented in a smart client.

The type was given as 'application/json', but this doesn't really tell the client the schema of the domain
object that is involved in the indicated resource.

