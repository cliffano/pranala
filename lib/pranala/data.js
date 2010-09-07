var CouchDB = require('../node-couch').CouchDB;
var sys = require('sys');

var Data = function(dbHost, dbName, debug) {
    CouchDB.debug = debug || false;
    sys.log('Connecting to database ' + dbName + ' on ' + dbHost);
	this.db = CouchDB.db(dbName, dbHost);
};
Data.prototype.getUrlDoc = function(code, successCb, errorCb) {
    this.db.openDoc(code, {
        success: successCb,
        error: errorCb
    });
};
Data.prototype.getUrlDocsByUrl = function(url, successCb, errorCb) {
    this.db.view('content/url_code?key="' + encodeURIComponent(url) + '"', {
        success: successCb,
        error: errorCb
    });
};
Data.prototype.saveUrlDoc = function(code, url, sequence, date, successCb, errorCb) {
    this.db.saveDoc({
        _id: code, type: 'url', url: url, seq: sequence, date: date
    }, {
        success: successCb,
        error: errorCb
    });
};
Data.prototype.deleteUrlDoc = function(code, successCb, errorCb) {
    this.db.removeDoc({
        _id: code
    }, {
        success: successCb,
        error: errorCb
    });
};
Data.prototype.getStatDocs = function(successCb, errorCb) {
    this.db.view('content/stat_url?group=true', {
        success: successCb,
        error: errorCb
    });
};
Data.prototype.saveStatDoc = function(code, url, key, referer, date, successCb, errorCb) {
	sys.log('code: ' + code + ', url: ' + url + ', key: ' + key + ', referer: ' + referer + ', date: ' + date);
    this.db.saveDoc({
        type: 'stat', code: code, url: url, key: key, referer: referer, date: date
    }, {
        success: successCb,
        error: errorCb
    });
};

exports.Data = Data;