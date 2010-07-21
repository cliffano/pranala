var CouchDB = require('../node-couch').CouchDB;
var sys = require('sys');

var Data = function(dbHost, dbName, debug) {
    CouchDB.debug = debug || false;
    sys.log('Connecting to database ' + dbName + ' on ' + dbHost);
	this.db = CouchDB.db(dbName, dbHost);
};
Data.prototype.getDoc = function(code, successCb, errorCb) {
    this.db.openDoc(code, {
        success: successCb,
        error: errorCb
    });
};
Data.prototype.getDocByUrl = function(url, successCb, errorCb) {
    this.db.view('content/by_url?key="' + encodeURIComponent(url) + '"', {
        success: successCb,
        error: errorCb
    });
};
Data.prototype.saveDoc = function(code, url, sequence, successCb, errorCb) {
	sys.log('code: ' + code + ', url: ' + url + ', sequence: ' + sequence);
    this.db.saveDoc({
        _id: code, url: url, seq: sequence
    }, {
        success: successCb,
        error: errorCb
    });
};
Data.prototype.deleteDoc = function(code, successCb, errorCb) {
    this.db.removeDoc({
        _id: code
    }, {
        success: successCb,
        error: errorCb
    });
};

exports.Data = Data;