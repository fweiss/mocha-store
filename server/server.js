const Mongoose = require('mongoose').Mongoose;
const mongoose = new Mongoose();
const dao = require('./mongoose-dao')

dao.connect(mongoose, 'mongodb://localhost:27017/AcceptanceDB')

require('./store-app.js')(dao)
    .listen(8001)
