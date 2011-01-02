var url = exports;

url.sanitise = function (url) {
    if (!url.match(/^https?:\/\//)) {
        url = 'http://' + url;
    }
    return url;
};
url.isValid = function (url) {
    var isValid = false, parsedUrl;
    if (url && url.match(/^https?:\/\/[0-9a-zA-Z]([\-.\w]*[0-9a-zA-Z])*(:[0-9]+)*(\/([a-zA-Z0-9=:\-\.\?\,\'\/\\\+&amp;%\$#_!]*))?$/)) {
	    isValid = true;
	    parsedUrl = require('url').parse(url);
	    if (parsedUrl.host && !parsedUrl.host.match(/[0-9a-zA-Z\-]+\.[0-9a-zA-Z]+/)) {
		    isValid = false;
	    }
    }
    return isValid;
};
url.isBlacklisted = function (url) {
    var blacklist = ['chinamama518.com'],
        domain = url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/.*$/, '').replace(/:.*$/, '');
    return (blacklist.indexOf(domain) >= 0);
}; 
url.isShortened = function (url) {
    var shorteners = ['bit.ly', 'de.tk', 'j.mp', 'ow.ly', 'ht.ly', 'prn.la', 'tinyurl.com', 'tr.im', 'is.gd', 'aw.sm', 'pendek.in', 'siteo.us', 'ketkp.in', 'mangk.us', 'bu.tt'],
        domain = url.replace(/^https?:\/\//, '').replace(/\/.*$/, '').replace(/:.*$/, '');
    return (shorteners.indexOf(domain) >= 0);
};
url.validate = function (url) {
    var error = null;
    if (url === null || url.trim() === '') {
        error = 'EMPTY';
    } else if (!this.isValid(url)) {
        error = 'INVALID';
    } else if (this.isShortened(url)) {
        error = 'ALREADY_SHORTENED';
    } else if (this.isBlacklisted(url)) {
        error = 'BLACKLISTED';
    }
    return error;
};