var expect = require('expect.js')
var request = require('supertest')

var Mongoose = require('mongoose').Mongoose;
var mongoose = new Mongoose();

const { MongoMemoryServer } = require('mongodb-memory-server');

const dao = require('../../server/mongoose-dao.js')

module.exports = () => {

    describe.skip('database connection', async () => {
        let mongoUri
        before(async () => {
            mongoServer = new MongoMemoryServer()
            mongoUri = await mongoServer.getUri()
        })
        after(async () => {
            await mongoose.disconnect()
            await mongoServer.stop()
        })
        it('error when bad address ', () => {

            mongoUri = 'mongodb://127.0.0.2:55663/53c937e4-4296-4769-9174-70a4af08b58b?'
            let options = {
                serverSelectionTimeoutMS: 100
            }
            return dao.connect(mongoose, mongoUri, options)
                .then(() => {
                    return Promise.reject('expected mongodb connect to fail');
                })
                .catch((err) => {
                    if (typeof err === 'string') {
                        return Promise.reject(new Error(err));
                    }
                    return Promise.resolve(err);
                })
                .then((err) => {
                    expect(err).to.not.be.undefined
                    expect(err.message).to.contain('timed out')
                    expect(err.message).to.contain('Server selection')
                });

        })
    })

}
