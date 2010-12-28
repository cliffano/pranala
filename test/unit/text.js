var assert = require('assert');
var Text = require('../../lib/pranala/text').Text;
var vows = require('vows');

var dir = 'test/text';

vows.describe('Text').addBatch({
    'Text': {
        'when dir exists': {
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
            },
            'return key when lang file does not exist': function(topic) {
                assert.equal(topic.get('oxoo', 'does_not_exist'), '{oxoo:does_not_exist}');
            },
            'return key when key does not exist in lang file': function(topic) {
                assert.equal(topic.get('id', 'does_not_exist'), '{id:does_not_exist}');
            },
            'return meta with all lang info': function(topic) {
                var meta = topic.meta();
                assert.equal(meta.length, 2);
                assert.equal(meta[0].code, 'id');
                assert.equal(meta[0].name, 'Bahasa Indonesia');
                assert.equal(meta[1].code, 'en');
                assert.equal(meta[1].name, 'English');
            }
        }
    }
}).run();