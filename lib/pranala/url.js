var url = exports;

url.sanitise = function(url) {
    if (!url.match(/^https?:\/\//)) {
        url = 'http://' + url;
    }
    return url;
};
url.isValid = function(url) {
    var isValid = false;
    if (url && url.match(/https?:\/\/([-\w\.]+)+(:\d+)?(\/([\w/_\.]*(\?\S+)?)?)?/)) {
        isValid = true;
    }
    return isValid;
};
url.isBlacklisted = function(url) {
    var blacklist = new Array('bit.ly', 'de.tk', 'j.mp', 'ow.ly', 'prn.la', 'tinyurl.com', 'tr.im', 'pendek.in');
    var isBlacklisted = false;
    for (var i = 0; i < blacklist.length; i++) {
        var regex = new RegExp('^https?:\/\/' + blacklist[i] + '.*', 'g');
        if (url.match(regex)) {
            isBlacklisted = true;
            break;
        }    
    }
    return isBlacklisted;
};
url.validate = function(url) {
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
url.validateShort = function(url, appUrl) {
	var error = null;
    var regex = new RegExp(appUrl + '/[a-zA-Z0-9]+', 'g');
	if (url === null || !url.match(regex)) {
		error = 'TIDAK_DITEMUKAN';
	}
	return error;
}