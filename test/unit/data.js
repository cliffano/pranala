var assert = require('assert'),
	path = require('path'),
	vows = require('vows'),
	Data = require('../../lib/pranala/data').Data;

vows.describe('Data').addBatch({
	'data': {
		topic: new Data({db: { name: 'http://localhost:5984', url: 'pranala' }}, true),
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
}).export(module);