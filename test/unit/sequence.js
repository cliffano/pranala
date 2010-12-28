var assert = require('assert'),
    fs = require('fs'),
    Sequence = require('../../lib/pranala/sequence').Sequence,
    vows = require('vows');

vows.describe('Sequence').addBatch({
    'Sequence': {
        'with existing file': {
            topic: function() {
	            this.file = 'build/test/sequence-exist.txt';
	            fs.writeFileSync(this.file, '888');
	            return new Sequence(this.file);
	        },
            'has a value of 0': function(topic) {
	            assert.equal(topic.get(), 888);
            },
            'has a value of 890 after incrementing 2 times': function(topic) {
	            topic.increment();
	            topic.increment();
	            assert.equal(topic.get(), 890);
            },
            'has a value of 888 in file': function(topic) {
	            assert.equal(fs.readFileSync(this.file), 888);
	            assert.equal(topic.get(), 890);
            },
			'has a value of 890 after persisting': function(topic) {
				topic.persist();
	            assert.equal(fs.readFileSync(this.file), 890);
	            assert.equal(topic.get(), 890);
            }
        }
    }
}).run();