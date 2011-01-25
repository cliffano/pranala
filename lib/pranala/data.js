var cradle = require('cradle'),
    logger = require('log4js')().getLogger('data');

var Data = function (_db, debug) {
    logger.info('Connecting to database ' + _db.name + ' on ' + _db.host + ':' + _db.port);
	this.db = new(cradle.Connection)(_db.host, _db.port).database(_db.name);
};
Data.prototype.getUrlDoc = function (code, cb) {
    this.db.get(code, cb);
};
Data.prototype.getUrlDocsByUrl = function (url, cb) {
	this.db.view('content/url_code', { key: url } , cb);
};
Data.prototype.saveUrlDoc = function (code, url, sequence, date, cb) {
    this.db.save({
        _id: code,
        type: 'url',
        url: url,
        seq: sequence,
        date: date
    }, cb);
};
Data.prototype.deleteUrlDoc = function (code, cb) {
    this.db.remove(code, cb);
};
Data.prototype.getStatDocs = function (type, cb) {
    this.db.view('content/stat_url_' + type, { group: true}, cb);
};
Data.prototype.saveStatDoc = function (code, url, key, remoteAddress, referer, userAgent, date, cb) {
	logger.debug('code: ' + code + ', url: ' + url + ', key: ' + key + ', remoteAddress: ' + remoteAddress + ', referer: ' + referer + ', user-agent: ' + userAgent + ', date: ' + date);
    this.db.save({
        type: 'stat',
        code: code,
        url: url,
        key: key,
        remoteAddress: remoteAddress,
        referer: referer,
        userAgent: userAgent,
        date: date
    }, cb);
};

exports.Data = Data;
