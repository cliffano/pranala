var assert = require('assert');
var url = require('../../lib/pranala/url');
var vows = require('vows');

vows.describe('URL').addBatch({
    'URL': {
        'sanitise': {
            'keeps original URL': function() {
	            assert.equal(url.sanitise('http://prn.la'), 'http://prn.la');
	            assert.equal(url.sanitise('https://prn.la'), 'https://prn.la');
            },
			'adds protocol to URL': function() {
	            assert.equal(url.sanitise('prn.la'), 'http://prn.la');
            }
        },
		'validation': {
            'returns true for valid URLs': function() {
	            assert.isTrue(url.isValid('http://prn.la'));
	            assert.isTrue(url.isValid('https://prn.la'));
	            assert.isTrue(url.isValid('http://prn.la/a/b/c'));
                assert.isTrue(url.isValid('http://prn.la:8080/index.php?p=1&q=2&r=3'));
            },
			'return false for invalid URLs': function() {
	            assert.isFalse(url.isValid('()'));
	            assert.isFalse(url.isValid('dum dee dum dee dum'));
	            // TODO: improve URL validation pattern
	            // assert.isFalse(url.isValid('http://prn.la some path'));
	            assert.isFalse(url.isValid(null));
	            assert.isFalse(url.isValid(undefined));
	            assert.isFalse(url.isValid('ftp://prn.la'));
	            assert.isFalse(url.isValid('httpx://prn.la'));
	            assert.isFalse(url.isValid('prn.la'));
            }
        },
		'blacklist': {
            'returns true for URLs with blacklisted domain': function() {
	            assert.isTrue(url.isBlacklisted('http://prn.la'));
	            assert.isTrue(url.isBlacklisted('http://prn.la/11A9'));
	            assert.isTrue(url.isBlacklisted('http://ow.ly:8080/index.php'));
            },
			'return false for URLs with non-blacklisted domain': function() {
	            assert.isFalse(url.isBlacklisted('http://nba.com'));
	            assert.isFalse(url.isBlacklisted('http://nba.com/lakers/threepeat'));
            }
        },
		'validate': {
            'returns correct error codes': function() {
	            assert.isNull(url.validate('http://nba.com'));
	            assert.equal(url.validate(null), 'inexistent');
	            assert.equal(url.validate('       '), 'inexistent');
	            assert.equal(url.validate('http://prn.la'), 'blacklisted');
	            assert.equal(url.validate('http://()'), 'invalid');
            }
        },
		'validate': {
            'returns correct error codes for shortened URL': function() {
	            var appHost = 'http://prwn.la:1';
	            assert.isNull(url.validateShort('http://prwn.la:1/09', appHost));
	            assert.isNull(url.validateShort('http://prwn.la:1/az', appHost));
	            assert.isNull(url.validateShort('http://prwn.la:1/AZ', appHost));
	            assert.equal(url.validateShort('http://prwn.la:1', appHost), 'notshortened');
	            assert.equal(url.validateShort('http://prwn.la:1/', appHost), 'notshortened');
	            assert.equal(url.validateShort('http://prwn.la:1/-', appHost), 'notshortened');
	            assert.equal(url.validateShort('prwn.la:1', appHost), 'notshortened');
	            assert.equal(url.validateShort(null, appHost), 'notshortened');
	            assert.equal(url.validateShort('', appHost), 'notshortened');
	            assert.equal(url.validateShort('http://nba.com', appHost), 'notshortened');
            }
        }
    }
}).run();