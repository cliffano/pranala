var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
var base = chars.length;

var base62 = exports;

base62.encode = function(n) {
    n += base;
    var code = '';
    while  (n > 0) {
        code = chars.charAt(n % base) + code;
        n = Math.floor(n / base);
    }
    return code;
};
base62.decode = function(code) {
    var i = 0;
    var n = 0;
    while (i < code.length) {
        var letter = code[i++];
        var pos = i - 1;
        n += chars.indexOf(letter) * (Math.pow(base, (code.length - pos - 1)));
    }
    return n - base;
};