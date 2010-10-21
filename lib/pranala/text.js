var conf = require('../../conf/conf').conf,
    fs = require('fs'),
    log4js = require('log4js'),
    path = require('path'),
    sys = require('sys');

var env = process.env.ENV,
    appConf = conf.env[env],
    logger = log4js.getLogger('text'),
    logFile = appConf.logFile,
    logLevel = appConf.logLevel;

log4js.addAppender(log4js.fileAppender(logFile), 'text');
logger.setLevel(logLevel);

var Text = function (dir) {
    var fileNames = fs.readdirSync(dir),
        fileValue, lang, i, ln;
    this.texts = {};
    for (i = 0, ln = fileNames.length; i < ln; i += 1) {
        if (fileNames[i].match(/.json$/)) {
            fileValue = fs.readFileSync(path.join(dir, fileNames[i]));
            lang = fileNames[i].replace('.json', '');
            this.texts[lang] = {};
            this.texts[lang] = (JSON.parse(fileValue));
        }
    }
    logger.info('Initialising text with dir: ' + dir);
};
Text.prototype.get = function (lang, key, _params) {
    var text = this.texts[lang],
        params = _params || [],
        sepPos, i, ln, keyPart;
    if (text) {
        do {
            sepPos = key.indexOf('.');
            keyPart = (sepPos >= 0) ? key.substring(0, sepPos) : key;
            key = key.replace(keyPart + '.', '');
            text = text[keyPart];
        } while (sepPos >= 0);
        for (i = 0, ln = params.length; i < ln; i += 1) {
            text = text.replace('{' + i + '}', params[i]);
        }
    }
    if (text === undefined) {
        text = '{' + lang + ':' + key + '}';
    }
    return text;
};
Text.prototype.meta = function() {
    // preserve langs order as how they'll be displayed on the page
    var langs = [ 'id', 'en' ],
        i, ln, meta = [];
    for (i = 0, ln = langs.length; i < ln; i += 1) {
        meta.push(this.texts[langs[i]].meta);
    }
    return meta;
};

exports.Text = Text;