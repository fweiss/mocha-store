var expect = require('expect.js')
var request = require('supertest')

// var mockgoose = require('mockgoose')
// var mongoose = require('mongoose')
//
// mockgoose(mongoose)

var Mongoose = require('mongoose').Mongoose;
var mongoose = new Mongoose();

var Mockgoose = require('mockgoose').Mockgoose;
var mockgoose = new Mockgoose(mongoose);

describe.only('db2', function() {
    var app = require('../server/mockgoose-test')(mongoose);
    var api = request(app);
    before(function(done) {
        mockgoose.prepareStorage().then(function () {
            mongoose.connect('mongodb://example.com/TestingDB', function (err) {
                done(err);
            });
        });
    })
    beforeEach(function(done) {
        mockgoose.helper.reset().then(function() {
            var schema = new mongoose.Schema({ drink: 'string', cost: 'string' });
            var Order = mongoose.model('Order', schema);
            var small = new Order({ drink: 'latte', cost: '3.40'})
            small.save(function() {
                done()
            })
        })

        // create and insert two dummy docs
        // Tank.model.create({ text: 'write blog on A' }, { text: 'write blog on B' }, function(err, blogOnA, blogOnB) {
        //     if(err) {
        //         console.log('Error creating documents in beforeEach: ' + error);
        //         throw(err);
        //     }
        //     done();
        // });
    })
   it('gets order', function(done) {
        api.get('/test').end(function(err, res) {
            expect(res.body.length).to.be(1)
            const order = res.body[0]
            expect(order.drink).to.eql('latte')
            expect(order.cost).to.be('3.40')
            done()
        })
    })

})

