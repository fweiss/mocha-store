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
