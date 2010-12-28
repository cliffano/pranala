var fs = require('fs'),
    logger = require('log4js').getLogger('sequence');

var Sequence = function (file) {
	var fileValue, error, message;
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
	        message = 'Sequence file does not exist, please manually create file ' + this.file + ' with value 0';
	    } else {
	        message = 'Unexpected error, sequence file ' + this.file + ' with value ' + this.value + '\n' + exception.message;
        }
        logger.error(message);
        process.exit(1);
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