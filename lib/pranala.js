var cache = require('../lib-vendor/node-cache'),
	fs = require('fs'),
    log4js = require('log4js')(),
    sys = require('sys'),
    conf = JSON.parse(fs.readFileSync('./app.conf', 'utf-8')),
    Base62 = require('./pranala/base62').Base62,
    Data = require('./pranala/data').Data,
    Sequence = require('./pranala/sequence').Sequence,
    Text = require('./pranala/text').Text;

var env = process.env.ENV,
    logger = log4js.getLogger('pranala');

log4js.addAppender(log4js.fileAppender(conf.log.file), 'pranala');
logger.setLevel(conf.log.level);

var Pranala = function (db, sequenceFile, textDir) {
    logger.info('Initialising Pranala');
	this.base62 = new Base62(),
	this.data = new Data(db, false);
    this.sequence = new Sequence(sequenceFile);
    this.text = new Text(textDir);
};
Pranala.prototype.encode = function (_url, resultCb) {
	var self = this,
	    _sequence, code, cb, error,
        callback = function (err, result) {
            if (err) {
				throw new Error('Unexpected error ' + sys.inspect(err) + ', unable to get document for url ' + _url);
		    }
			if (result.rows.length === 0) {
				_sequence = self.sequence.increment();
				code = self.base62.encode(_sequence);
				cb = function (err, doc) {
					if (err) {
						throw new Error('Unexpected error ' + sys.inspect(err) + ', unable to save new URL document with code ' + code + ', url ' + _url + ', sequence ' + _sequence);
					}
					self.persist();
					resultCb(doc);
				};
				self.data.saveUrlDoc(code, _url, _sequence, new Date(), cb);
			} else if (result.rows.length >= 1) {
				code = result.rows[0].value;
				cb = function (err, doc) {
					if (err) {
						throw new Error('Unexpected error ' + sys.inspect(error) + ', unable to get URL document for code ' + code);
					}
					resultCb(doc);
				};
				self.data.getUrlDoc(code, cb);
			} else {
				error = {};
				throw new Error('Unexpected error, there are ' + result.rows.length + ' documents for url ' + _url);
			}
		};
	this.data.getUrlDocsByUrl(_url, callback);
};
Pranala.prototype.decode = function (code, resultCb) {
    var cb = function (err, doc) {
            resultCb((err) ? null : doc);
        };
    this.data.getUrlDoc(code, cb);
};
Pranala.prototype.custom = function (_url, code, resultCb) {
    var _sequence = -1,
        cb = function (err, doc) {
			if (err) {
				throw new Error('Unexpected error ' + sys.inspect(error) + ', unable to save new URL document with code ' + code + ', url ' + _url + ', sequence ' + _sequence);
			}
            resultCb(doc);
        };
    self.data.saveUrlDoc(code, _url, _sequence, new Date(), cb);
};
Pranala.prototype.stat = function (code, url, key, remoteAddress, referer, userAgent, resultCb) {
    var cb = function (err, doc) {
		if (err) {
			throw new Error('Unexpected error ' + sys.inspect(error) + ', unable to save stat document with code ' + code + ', url ' + url + ', key ' + key);
		}
        resultCb(doc);
    };
    this.data.saveStatDoc(code, url, key, remoteAddress, referer, userAgent, new Date(), cb);
};
Pranala.prototype.hotlinks = function (type, resultCb) {
    var cached, cb = function (err, result) {
		    if (err) {
				throw new Error('Unexpected error ' + sys.inspect(error) + ', unable to retrieve stat documents');
			}
            result.rows.sort(function (a, b) {
                return b.value - a.value;
            });
            var docs = result.rows.slice(0, 20);
            cache.put('hotlinks-' + type, docs, 86400000);
            resultCb(docs);
        };
    cached = cache.get('hotlinks-' + type);
    if (cached) {
        resultCb(cached);
    } else {
        this.data.getStatDocs(type, cb);
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
