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
url.isBlacklisted = function (url) {
    var blacklist = ['bit.ly', 'de.tk', 'j.mp', 'ow.ly', 'ht.ly', 'prn.la', 'tinyurl.com', 'tr.im', 'pendek.in', 'siteo.us', 'ketkp.in', 'mangk.us'],
        isBlacklisted = false, i, len, regex;
    for (i = 0, len = blacklist.length; i < len; i += 1) {
        regex = new RegExp('^https?:\/\/' + blacklist[i] + '.*', 'g');
        if (url.match(regex)) {
            isBlacklisted = true;
            break;
        }    
    }
    return isBlacklisted;
};
url.validate = function (url) {
    var error = null;
    if (url === null || url.trim() === '') {
        error = 'TIDAK_ADA';
    } else if (!this.isValid(url)) {
        error = 'TIDAK_SAHIH';
    } else if (this.isBlacklisted(url)) {
        error = 'SUDAH_DIPENDEKKAN';
    }
    return error;
};
url.validateShort = function (url, appUrl) {
	var error = null,
	    regex = new RegExp(appUrl + '/[a-zA-Z0-9]+', 'g');
	if (url === null || !url.match(regex)) {
		error = 'TIDAK_DITEMUKAN';
	}
	return error;
};