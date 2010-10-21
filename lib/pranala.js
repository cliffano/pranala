var base62 = require('./pranala/base62'),
    conf = require('../conf/conf').conf,
    Data = require('./pranala/data').Data,
    log4js = require('log4js'),
    Sequence = require('./pranala/sequence').Sequence,
    sys = require('sys'),
    Text = require('./pranala/text').Text,
    url = require('./pranala/url');

var env = process.env.ENV,
    appConf = conf.env[env],
    logger = log4js.getLogger('pranala'),
    logFile = appConf.logFile,
    logLevel = appConf.logLevel;

log4js.addAppender(log4js.fileAppender(logFile), 'pranala');
logger.setLevel(logLevel);

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
Pranala.prototype.stat = function (code, url, key, remoteAddress, referer, userAgent, resultCb) {
    var successCb = function (doc) {
        resultCb(doc);
    },
    errorCb = function (error) {
        throw new Error('Unexpected error ' + sys.inspect(error) + ', unable to save stat document with code ' + code + ', url ' + url + ', key ' + key);
    };
    this.data.saveStatDoc(code, url, key, remoteAddress, referer, userAgent, new Date(), successCb, errorCb);
};
Pranala.prototype.popular = function (resultCb) {
    var successCb = function (result) {
            result.rows.sort(function (a, b) {
                return a.value - b.value;
            });
            result.rows.reverse();
            resultCb(result.rows);
        },
        errorCb = function (error) {
            throw new Error('Unexpected error ' + sys.inspect(error) + ', unable to retrieve stat documents');
        };
    this.data.getStatDocs(successCb, errorCb);
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
