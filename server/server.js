const dao = require('./mongoose-dao')
require('./store-app.js')(dao).listen(8001)
