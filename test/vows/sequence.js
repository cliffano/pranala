var assert = require('assert');
var fs = require('fs');
var path = require('path');
var Sequence = require('../../lib/pranala/sequence').Sequence;
var vows = require('vows');

var dir = 'build/test';

vows.describe('Sequence').addBatch({
    'Sequence': {
        'with new file': {
            topic: function() {
	            this.file = path.join(dir, 'sequence-new.txt');
	            return new Sequence(this.file);
	        },
            'has a value of 0': function(topic) {
	            assert.equal(topic.get(), 0);
            },
            'has a value of 3 after incrementing 3 times': function(topic) {
	            topic.increment();
	            topic.increment();
	            topic.increment();
	            assert.equal(topic.get(), 3);
            },
            'has a value of 0 in file': function(topic) {
	            assert.equal(fs.readFileSync(this.file), 0);
	            assert.equal(topic.get(), 3);
            },
			'has a value of 3 in file after persisting': function(topic) {
				topic.persist();
	            assert.equal(fs.readFileSync(this.file), 3);
	            assert.equal(topic.get(), 3);
            }
        },
        'with existing file': {
            topic: function() {
	            this.file = path.join(dir, 'sequence-exist.txt');
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
        },
        'with invalid existing file': {
            topic: function() {
	            this.file = path.join(dir, 'sequence-invalid.txt');
	            fs.writeFileSync(this.file, 'zzz');
			    return new Sequence(this.file);
	        },
			'throws error': function(topic) {
				// TODO: test error being rethrown
            }
        }
    }
}).run();