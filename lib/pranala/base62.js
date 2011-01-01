var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
    base = chars.length,
    base62 = exports;

base62.encode = function (n) {
    n += base;
    var code = '';
    while  (n > 0) {
        code = chars.charAt(n % base) + code;
        n = Math.floor(n / base);
    }
    return code;
};
base62.decode = function (code) {
    var i = 0, n = 0, letter, pos;
    while (i < code.length) {
        letter = code[i];
	    i += 1;
        pos = i - 1;
        n += chars.indexOf(letter) * (Math.pow(base, (code.length - pos - 1)));
    }
    return n - base;
};