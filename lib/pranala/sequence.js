var conf = require('../../conf/conf').conf,
    fs = require('fs'),
    log4js = require('log4js');

var env = process.env.ENV,
    appConf = conf.env[env],
    logger = log4js.getLogger('sequence'),
    logFile = appConf.logFile,
    logLevel = appConf.logLevel;

log4js.addAppender(log4js.fileAppender(logFile), 'sequence');
logger.setLevel(logLevel);

var Sequence = function (file) {
	var fileValue, error;
    this.file = file;
	try {
		fileValue = fs.readFileSync(this.file);
	    this.value = parseInt(fileValue, 0);
        if (isNaN(this.value)) {
	        error = {};
	        error.message = 'Sequence file ' + this.file + ' must not contain non-numeric value ' + fileValue;
	        throw error;
        }
    } catch (exception) {
	    if (exception.message.match(/No such file/)) {
	        this.value = 0;
	        logger.info('Creating new sequence file ' + this.file);
	        fs.writeFileSync(this.file, this.value + '');	
	    } else {
	        error = {};
	        error.message = 'Unexpected error, sequence file ' + this.file + ' with value ' + this.value + '\n' + exception.message;
	        // TODO: rethrow error
	        // process.exit(1);
        }
    }
    logger.info('Initializing sequence from file ' + this.file + ' with value ' + this.value);
};
Sequence.prototype.get = function () {
	return this.value;
};
Sequence.prototype.increment = function () {
	this.value += 1;
    return this.value;
};
Sequence.prototype.persist = function () {
    logger.info('Persisting sequence file ' + this.file + ' with value ' + this.value);
    fs.writeFileSync(this.file, this.value + '');
};

exports.Sequence = Sequence;