const Mongoose = require('mongoose').Mongoose;
const mongoose = new Mongoose();
const dao = require('./mongoose-dao')

const mongoUri = 'mongodb://localhost:27017/AcceptanceDB'
let options = {
    serverSelectionTimeoutMS: 100
}
dao.connect(mongoose, mongoUri, options)
    .catch((err) => {
        console.log('connect: ' + mongoUri + ':  failed: ' + err)
    })

require('./store-app.js')(dao)
    .listen(8001)
