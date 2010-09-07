var base62 = require('./pranala/base62');
var Data = require('./pranala/data').Data;
var Sequence = require('./pranala/sequence').Sequence;
var sys = require('sys');
var url = require('./pranala/url');

var Pranala = function(dbHost, dbName, sequenceFile) {
	sys.log('Initialising Pranala');
    this.data = new Data(dbHost, dbName, false);
    this.sequence = new Sequence(sequenceFile);
};
Pranala.prototype.encode = function(_url, resultCb) {
	var self = this;
    var callback = function(result) {
        if (result.rows.length === 0) {
            var _sequence = self.sequence.increment();
            var code = base62.encode(_sequence);
            var successCb = function(doc) {
	            self.persist();
                resultCb(doc);
            };
            var errorCb = function(error) {
	            sys.debug('Unexpected error ' + sys.inspect(error) + ', unable to save new URL document with code ' + code + ', url ' + _url + ', sequence ' + _sequence);
                //throw new Error(error.error);
            };
            self.data.saveUrlDoc(code, _url, _sequence, successCb, errorCb);
        } else if (result.rows.length >= 1) {
            var code = result.rows[0].value;
            var successCb = function(doc) {
                resultCb(doc);
            };
            var errorCb = function(error) {
	            sys.debug('Unexpected error ' + sys.inspect(error) + ', unable to get URL document for code ' + code);
                //throw new Error(error.error);
            };
            self.data.getUrlDoc(code, successCb, errorCb);
        } else {
	        var error = new Object();
	        error.message = 'Unexpected error, there are ' + result.rows.length + ' documents for url ' + _url;
	        //throw new Error(error.message);
        }
    };
	this.data.getUrlDocByUrl(_url, callback, null);
};
Pranala.prototype.decode = function(code, resultCb) {
    var successCb = function(doc) {
        resultCb(doc);
    };
    var errorCb = function(error) {
        resultCb(null);
    };
    this.data.getUrlDoc(code, successCb, errorCb);
};
Pranala.prototype.stat = function(code, url, key, referer, resultCb) {
    var successCb = function(doc) {
        resultCb(doc);
    };
    var errorCb = function(error) {
        sys.debug('Unexpected error ' + sys.inspect(error) + ', unable to save stat document with code ' + code + ', url ' + url + ', key ' + key + ', ip ' + ip);
        //throw new Error(error.error);
    };
    this.data.saveStatDoc(code, url, key, referer, new Date(), successCb, errorCb);
};
Pranala.prototype.persist = function() {
	sys.log('Persisting Pranala');
    this.sequence.persist();
};

exports.Pranala = Pranala;