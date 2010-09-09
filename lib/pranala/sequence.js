var conf = require('../../conf/conf').conf,
    fs = require('fs'),
    log4js = require('log4js');

var env = process.env['PRANALA_ENV'],
    appConf = conf.env[env],
    logger = log4js.getLogger('data'),
    logFile = appConf.logFile,
    logLevel = appConf.logLevel;

log4js.addAppender(log4js.fileAppender(logFile), 'sequence');
logger.setLevel(logLevel);

var Sequence = function(file) {
    this.file = file;
	try {
		var fileValue = fs.readFileSync(this.file);
	    this.value = parseInt(fileValue);
        if (isNaN(this.value)) {
	        var error = new Object();
	        error.message = 'Sequence file ' + this.file + ' must not contain non-numeric value ' + fileValue;
	        throw error;
        }
    } catch (error) {
	    if (error.message.match(/No such file/)) {
	        this.value = 0;
	        logger.info('Creating new sequence file ' + this.file);
	        fs.writeFileSync(this.file, this.value + '');	
	    } else {
		    var cause = error;
	        var error = new Object();
	        error.message = 'Unexpected error, sequence file ' + this.file + ' with value ' + this.value + '\n' + cause.message;
	        // TODO: rethrow error
	        // process.exit(1);
        }
    }
    logger.info('Initializing sequence from file ' + this.file + ' with value ' + this.value);
};
Sequence.prototype.get = function() {
	return this.value;
};
Sequence.prototype.increment = function() {
    return ++this.value;
};
Sequence.prototype.persist = function() {
	  logger.info('Persisting sequence file ' + this.file + ' with value ' + this.value)
    fs.writeFileSync(this.file, this.value + '');
};

exports.Sequence = Sequence;