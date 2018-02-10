var expect = require('expect.js')

// var mockgoose = require('mockgoose')
// var mongoose = require('mongoose')
//
// mockgoose(mongoose)

var Mongoose = require('mongoose').Mongoose;
var mongoose = new Mongoose();

var Mockgoose = require('mockgoose').Mockgoose;
var mockgoose = new Mockgoose(mongoose);

describe('db2', function() {
    beforeEach(function(done) {
        mockgoose.helper.reset().then(function() {
            mockgoose.prepareStorage().then(function() {
                mongoose.connect('mongodb://example.com/TestingDB', function(err) {
                    done(err);
                });
            });

            var schema = new mongoose.Schema({ name: 'string', size: 'string' });
            var Tank = mongoose.model('Tank', schema);
            var small = new Tank({ size: 'small'})
            small.save(function() {
                // done()
            })
            // done()
        })

        // create and insert two dummy docs
        // Tank.model.create({ text: 'write blog on A' }, { text: 'write blog on B' }, function(err, blogOnA, blogOnB) {
        //     if(err) {
        //         console.log('Error creating documents in beforeEach: ' + error);
        //         throw(err);
        //     }
        //     done();
        // });
    });
    it('works', function(done) {
        var Tank = mongoose.model('Tank')
        Tank.find({ }, 'name size', function(err, tasks) {
            expect(tasks.length).to.be(1)
            expect(tasks[0].size).to.be('small')
            done()
        })
    })

})

