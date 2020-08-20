var expect = require('expect.js')
var request = require('supertest')
const xml2js = require('xml2js')

const fakeDao = require('./fake-dao')

require('superagent').parse['application/atom+xml'] = function(res, fn) {
    res.text = '';
    res.setEncoding('utf8');
    res.on('data', function(chunk)  {
        res.text += chunk;
    });
    res.on('end', function() {
        try {
            xml2js.parseString(res.text, function(err, json) {
                fn(null, json)
            })
        } catch (e) {
            var err = e;
            // issue #675: return the raw response if the response parsing fails
            err.rawResponse = res.text || null;
            // issue #876: return the http status code if the response parsing fails
            err.statusCode = res.statusCode;
        }
        finally {
            // fn(err, body);
        }
    })
}

describe('atom feed', function() {
    var app = require('../server/store-app')(fakeDao);
    var api = request(app);
    describe('orders', () => {
        it('succeeds', function(done) {
            api.get('/orders').end(function(err, res) {
                expect(res.status).to.equal(200);
                done();
            });
        })
        describe('response', function() {
            var res
            beforeEach(function(done) {
                api.get('/orders').set('Accept', 'application/atom+xml').end(function(err, response) {
                    res = response
                    done()
                })
            })
            it('content type', function() {
                // ignore encoding for now
                expect(res.header['content-type']).to.contain('application/atom+xml');
            })
            it('feed xmlns', function() {
                expect(res.body.feed.$.xmlns).to.equal('http://www.w3.org/2005/Atom')
            })
            it('feed updated', function() {
                expect(res.body.feed.updated.length).to.equal(1)
                expect(res.body.feed.updated[0]).to.equal('20180201')
            })
        })    })

})
