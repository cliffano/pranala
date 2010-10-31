var conf = require('../../conf/conf').conf,
    CouchDB = require('../../lib-vendor/node-couch').CouchDB,
    log4js = require('log4js');

var env = process.env.ENV,
    appConf = conf.env[env],
    logger = log4js.getLogger('data'),
    logFile = appConf.logFile,
    logLevel = appConf.logLevel;

log4js.addAppender(log4js.fileAppender(logFile), 'data');
logger.setLevel(logLevel);

var Data = function (dbUrl, dbName, debug) {
    CouchDB.debug = debug || false;
    logger.info('Connecting to database ' + dbName + ' on ' + dbUrl);
    this.db = CouchDB.db(dbName, dbUrl);
};
Data.prototype.getUrlDoc = function (code, successCb, errorCb) {
    this.db.openDoc(code, {
        success: successCb,
        error: errorCb
    });
};
Data.prototype.getUrlDocsByUrl = function (url, successCb, errorCb) {
    this.db.view('content/url_code?key="' + encodeURIComponent(url) + '"', {
        success: successCb,
        error: errorCb
    });
};
Data.prototype.saveUrlDoc = function (code, url, sequence, date, successCb, errorCb) {
    this.db.saveDoc({
        _id: code,
        type: 'url',
        url: url,
        seq: sequence,
        date: date
    }, {
        success: successCb,
        error: errorCb
    });
};
Data.prototype.deleteUrlDoc = function (code, successCb, errorCb) {
    this.db.removeDoc({
        _id: code
    }, {
        success: successCb,
        error: errorCb
    });
};
Data.prototype.getStatDocs = function (type, successCb, errorCb) {
    this.db.view('content/stat_url_' + type + '?group=true', {
        success: successCb,
        error: errorCb
    });
};
Data.prototype.saveStatDoc = function (code, url, key, remoteAddress, referer, userAgent, date, successCb, errorCb) {
	logger.debug('code: ' + code + ', url: ' + url + ', key: ' + key + ', remoteAddress: ' + remoteAddress + ', referer: ' + referer + ', user-agent: ' + userAgent + ', date: ' + date);
    this.db.saveDoc({
        type: 'stat',
        code: code,
        url: url,
        key: key,
        remoteAddress: remoteAddress,
        referer: referer,
        userAgent: userAgent,
        date: date
    }, {
        success: successCb,
        error: errorCb
    });
};

exports.Data = Data;
