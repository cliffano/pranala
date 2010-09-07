var assert = require('assert');
var path = require('path');
var Data = require('../../lib/pranala/data').Data;
var vows = require('vows');

var dbHost = 'http://localhost:5984';
var dbName = 'pranala_test';

vows.describe('Data').addBatch({
    'Data': {
        topic: new Data(dbHost, dbName, true),
        'create new document': {
            topic: function(data) {
	            data.saveUrlDoc('1A', 'http://somelongdomain.org/path1/path2?q=what', '10', new Date(), this.callback, null);
	        },
            'has correct properties': function(result, error) {
		        assert.equal(result._id, '1A');
		        assert.equal(result.url, 'http://somelongdomain.org/path1/path2?q=what');
		        assert.equal(result.seq, 10);
            }
        },
        'get inexistent document': {
            topic: function(data) {
	            data.getUrlDoc('1X1Y1Z', null, this.callback);
	        },
            'has correct properties': function(result, error) {
                assert.equal(result.error, 'not_found');
                assert.equal(result.reason, 'missing');
            }
        }
    }
}).run();