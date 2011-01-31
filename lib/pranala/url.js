var Url = function (shorteners, blacklist) {
	this.shorteners = shorteners;
	this.blacklist = blacklist;
};
Url.prototype.sanitise = function (url) {
    if (!url.match(/^https?:\/\//)) {
        url = 'http://' + url;
    }
    return url;
};
Url.prototype.isValid = function (url) {
    var isValid = false, parsedUrl;
    if (url && url.match(/^https?:\/\/[0-9a-zA-Z]([\-.\w]*[0-9a-zA-Z])*(:[0-9]+)*(\/([a-zA-Z0-9=:\-\.\?\,\'\/\\\+&amp;%\$#_!]*))?$/)) {
	    isValid = true;
	    parsedUrl = require('url').parse(url);
	    if (parsedUrl.host &&
	        !parsedUrl.host.match(/[0-9a-zA-Z\-]+\.[0-9a-zA-Z]+/)) {
		    isValid = false;
	    }
    }
    return isValid;
};
Url.prototype.isBlacklisted = function (url) {
    var domain = url
            .replace(/^https?:\/\/(www\.)?/, '')
            .replace(/\/.*$/, '')
            .replace(/:.*$/, '');
    return (this.blacklist.indexOf(domain) >= 0);
}; 
Url.prototype.isShortened = function (url) {
    var domain = url
            .replace(/^https?:\/\//, '')
            .replace(/\/.*$/, '')
            .replace(/:.*$/, '');
    return (this.shorteners.indexOf(domain) >= 0);
};
Url.prototype.validateLong = function (url) {
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
Url.prototype.validateShort = function (code) {
    var error = null;
    if (code === null || !code.match(/^[0-9A-Za-z]+$/)) {
        error = 'NOT_FOUND';
    }
    return error;
};
Url.prototype.validateCustom = function (code) {
    var error = null;
    if (code === null || !code.match(/^[0-9A-Za-z]+\-[0-9A-Za-z]+$/)) {
        error = 'INVALID_CUSTOM';
    }
    return error;
};

exports.Url = Url;