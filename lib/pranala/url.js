var url = exports;

url.sanitise = function (url) {
    if (!url.match(/^https?:\/\//)) {
        url = 'http://' + url;
    }
    return url;
};
url.isValid = function (url) {
    var isValid = false, parsedUrl;
    if (url && url.match(/^https?:\/\/[0-9a-zA-Z]([\-.\w]*[0-9a-zA-Z])*(:[0-9]+)*(\/([a-zA-Z0-9=:\-\.\?\,\'\/\\\+&amp;%\$#_]*))?$/)) {
	    isValid = true;
	    parsedUrl = require('url').parse(url);
	    if (parsedUrl.host && !parsedUrl.host.match(/[0-9a-zA-Z\-]+\.[0-9a-zA-Z]+/)) {
		    isValid = false;
	    }
    }
    return isValid;
};
url.isShortened = function (url) {
    var shorteners = ['bit.ly', 'de.tk', 'j.mp', 'ow.ly', 'ht.ly', 'prn.la', 'tinyurl.com', 'tr.im', 'is.gd', 'aw.sm', 'pendek.in', 'siteo.us', 'ketkp.in', 'mangk.us'],
        isShortened = false, i, len, regex;
    for (i = 0, len = shorteners.length; i < len; i += 1) {
        regex = new RegExp('^https?:\/\/' + shorteners[i] + '.*', 'g');
        if (url.match(regex)) {
            isShortened = true;
            break;
        }    
    }
    return isShortened;
};
url.validate = function (url) {
    var error = null;
    if (url === null || url.trim() === '') {
        error = 'EMPTY';
    } else if (!this.isValid(url)) {
        error = 'INVALID';
    } else if (this.isShortened(url)) {
        error = 'ALREADY_SHORTENED';
    }
    return error;
};