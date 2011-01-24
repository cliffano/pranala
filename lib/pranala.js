var base62 = require('./pranala/base62'),
    cache = require('../lib-vendor/node-cache'),
    fs = require('fs'),
    conf = JSON.parse(fs.readFileSync('./app.conf', 'utf-8')),
    Data = require('./pranala/data').Data,
    log4js = require('log4js')(),
    Sequence = require('./pranala/sequence').Sequence,
    sys = require('sys'),
    Text = require('./pranala/text').Text,
    url = require('./pranala/url');

var env = process.env.ENV,
    logger = log4js.getLogger('pranala');

log4js.addAppender(log4js.fileAppender(conf.log.file), 'pranala');
logger.setLevel(conf.log.level);

var Pranala = function (dbUrl, dbName, sequenceFile, textDir) {
    logger.info('Initialising Pranala');
	this.data = new Data(dbUrl, dbName, false);
    this.sequence = new Sequence(sequenceFile);
    this.text = new Text(textDir);
};
Pranala.prototype.encode = function (_url, resultCb) {
	var self = this,
	    _sequence, code, successCb, errorCb, error,
        callback = function (result) {
        if (result.rows.length === 0) {
            _sequence = self.sequence.increment();
            code = base62.encode(_sequence);
            successCb = function (doc) {
	            self.persist();
                resultCb(doc);
            };
            errorCb = function (error) {
	            throw new Error('Unexpected error ' + sys.inspect(error) + ', unable to save new URL document with code ' + code + ', url ' + _url + ', sequence ' + _sequence);
            };
            self.data.saveUrlDoc(code, _url, _sequence, new Date(), successCb, errorCb);
        } else if (result.rows.length >= 1) {
            code = result.rows[0].value;
            successCb = function (doc) {
                resultCb(doc);
            };
            errorCb = function (error) {
	            throw new Error('Unexpected error ' + sys.inspect(error) + ', unable to get URL document for code ' + code);
            };
            self.data.getUrlDoc(code, successCb, errorCb);
        } else {
	        error = {};
	        throw new Error('Unexpected error, there are ' + result.rows.length + ' documents for url ' + _url);
        }
    };
	this.data.getUrlDocsByUrl(_url, callback, null);
};
Pranala.prototype.decode = function (code, resultCb) {
    var successCb = function (doc) {
            resultCb(doc);
        },
        errorCb = function (error) {
            resultCb(null);
        };
    this.data.getUrlDoc(code, successCb, errorCb);
};
Pranala.prototype.custom = function (_url, code, resultCb) {
    var _sequence = -1,
        successCb = function (doc) {
            resultCb(doc);
        },
        errorCb = function (error) {
	        throw new Error('Unexpected error ' + sys.inspect(error) + ', unable to save new URL document with code ' + code + ', url ' + _url + ', sequence ' + _sequence);
    };
    self.data.saveUrlDoc(code, _url, _sequence, new Date(), successCb, errorCb);
};
Pranala.prototype.stat = function (code, url, key, remoteAddress, referer, userAgent, resultCb) {
    var successCb = function (doc) {
        resultCb(doc);
    },
    errorCb = function (error) {
        throw new Error('Unexpected error ' + sys.inspect(error) + ', unable to save stat document with code ' + code + ', url ' + url + ', key ' + key);
    };
    this.data.saveStatDoc(code, url, key, remoteAddress, referer, userAgent, new Date(), successCb, errorCb);
};
Pranala.prototype.hotlinks = function (type, resultCb) {
    var cached, successCb = function (result) {
            result.rows.sort(function (a, b) {
                return b.value - a.value;
            });
            var docs = result.rows.slice(0, 20);
            cache.put('hotlinks-' + type, docs, 86400000);
            resultCb(docs);
        },
        errorCb = function (error) {
            throw new Error('Unexpected error ' + sys.inspect(error) + ', unable to retrieve stat documents');
        };
    cached = cache.get('hotlinks-' + type);
    if (cached) {
        resultCb(cached);
    } else {
        this.data.getStatDocs(type, successCb, errorCb);
    }
};
Pranala.prototype.getText = function (lang, key, params) {
    return this.text.get(lang, key, params);
};
Pranala.prototype.getLangs = function () {
    return this.text.meta();  
};
Pranala.prototype.persist = function () {
    logger.info('Persisting Pranala');
    this.sequence.persist();
};

exports.Pranala = Pranala;
