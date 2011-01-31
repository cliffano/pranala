var assert = require('assert'),
    vows = require('vows'),
	Base62 = require('../../lib/pranala/base62').Base62;

vows.describe('Base62').addBatch({
	'base62': {
		topic: new Base62(),
		'encode': {
			'has correct values for first 10 encodings': function(base62) {
				assert.equal(base62.encode(1), '11');
				assert.equal(base62.encode(2), '12');
				assert.equal(base62.encode(3), '13');
				assert.equal(base62.encode(4), '14');
				assert.equal(base62.encode(5), '15');
				assert.equal(base62.encode(6), '16');
				assert.equal(base62.encode(7), '17');
				assert.equal(base62.encode(8), '18');
				assert.equal(base62.encode(9), '19');
				assert.equal(base62.encode(10), '1A');
			},
			'has unique values for first 1000000 codes': function(base62) {
				var lastCode;
				for (var i = 1; i <= 1000000; i++) {
					var code = base62.encode(i);
					assert.notEqual(code, lastCode);
					assert.isFalse(code === lastCode);
					lastCode = code;
				}
				assert.equal(lastCode, '4CA2');
			}
		},
		'decode': {
			'has correct values for first 10 decodings': function(base62) {
				assert.equal(base62.decode('11'), 1);
				assert.equal(base62.decode('12'), 2);
				assert.equal(base62.decode('13'), 3);
				assert.equal(base62.decode('14'), 4);
				assert.equal(base62.decode('15'), 5);
				assert.equal(base62.decode('16'), 6);
				assert.equal(base62.decode('17'), 7);
				assert.equal(base62.decode('18'), 8);
				assert.equal(base62.decode('19'), 9);
				assert.equal(base62.decode('1A'), 10);
			},
			'has correct value for 1000000th code decoding': function(base62) {
				assert.equal(base62.decode('4CA2'), 1000000);
			}
		}
	}
}).export(module);