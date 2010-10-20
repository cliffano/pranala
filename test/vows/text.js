var assert = require('assert');
var Text = require('../../lib/pranala/text').Text;
var vows = require('vows');

var dir = 'test/text';

vows.describe('Text').addBatch({
    'Text': {
        'with lang files': {
            topic: function() {
                return new Text(dir);
	        },
            'return value of key without param': function(topic) {
                assert.equal(topic.get('id', 'title.without_param'), 'Nasi goreng');
                assert.equal(topic.get('en', 'title.without_param'), 'Fried rice');
            },
            'return value of key with param': function(topic) {
                var params = ['Cartman', 5];
                assert.equal(topic.get('id', 'title.with_param', params), 'Cartman ingin makan 5 piring nasi goreng');
                assert.equal(topic.get('en', 'title.with_param', params), 'Cartman wants to eat 5 plates of fried rice');
            }
        }
    }
}).run();