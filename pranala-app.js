var assetManager = require('connect-assetmanager'),
    assetHandler = require('connect-assetmanager-handlers'),
    conf = require('./conf/conf').conf,
    connect = require('connect'),
    express = require('express'),
	  log4js = require('log4js'),
    Pranala = require('./lib/pranala').Pranala,
    sys = require('sys'),
    texts = require('./conf/texts');
    url = require('./lib/pranala/url');

var logger = log4js.getLogger('app'),
    env = process.env['PRANALA_ENV'],
    appConf = conf.env[env],
    appUrl = appConf.appUrl,
    appPort = appConf.appPort,
    dbUrl = appConf.dbUrl,
    dbName = appConf.dbName,
    sequenceFile = appConf.sequenceFile,
    logFile = appConf.logFile,
    logLevel = appConf.logLevel,
    pranala = new Pranala(dbUrl, dbName, sequenceFile),
    texts = texts.texts;
		
log4js.addAppender(log4js.fileAppender(logFile), 'app');
logger.setLevel('DEBUG');

var app = express.createServer();
		
logger.info('Configuring application');
var assetManagerGroups = {
    'js': {
        'route': /\/b\/scripts\/pranala\.js/,
        'path': './public/scripts/',
        'dataType': 'javascript',
        'files': ['jquery-min-1.4.2.js', 'json2.js', 'clipboard.js', 'global.js']
    }, 'css': {
        'route': /\/b\/styles\/pranala\.css/,
        'path': './public/styles/',
        'dataType': 'css',
        'files': ['grids-min-2.8.1.css', 'global.css'],
        'preManipulate': {
            'MSIE': [
                assetHandler.yuiCssOptimize
            ],
            '^': [
                assetHandler.yuiCssOptimize
            ]
        }
    }
};
app.configure(function() {
    app.set('views', __dirname + '/views');
    app.use('/', connect.bodyDecoder());
    app.use('/', connect.methodOverride());
    app.use('/b/images', connect.staticProvider(__dirname + '/public/images'));
    app.use(assetManager(assetManagerGroups));
	app.error(function(error, req, res, next) {
	    if (error instanceof NotFound) {
		    res.render('404.ejs', {
		        locals: {
		            title: texts['title_404'],
		            message: texts['title_404']
		        }
		    });
	    } else {
		    logger.error(error.message);
		    res.render('500.ejs', {
		        locals: {
		            title: texts['title_500'],
		            message: texts['title_500']
		        }
		    });
	    }
	});
});
app.configure('dev', function() {
    app.set('reload views', 1000);
    app.use('/', connect.errorHandler({ dumpExceptions: true, showStack: true }));
});
app.configure('prd', function() {
    app.use('/', connect.errorHandler());
});

logger.info('Setting up routers');

// home page
app.get('/', function(req, res) {
	var url = req.query.pranala || 'http://';
    res.render('home.ejs', {
        locals: {
            title: texts['title_home'],
            url: url
        }
    });
});

// brochure pages
app.get('/b/:page', function(req, res) {
    res.render(req.params.page + '.ejs', {
        locals: {
            title: texts['title_' + req.params.page],
            appUrl: appUrl
        }
    });
});

// main form, twitter iphone
app.get('/x', function(req, res) {
    v0Shorten(req, res);
});

// shorten API
app.get('/v0/pendekkan', function(req, res) {
    v0Shorten(req, res);
});
var v0Shorten = function(req, res) {
    var _url = url.sanitise(decodeURIComponent(req.query.panjang || req.query.prn));
    var error = url.validate(_url);
    if (req.query.format === 'json') {
        if (error === null) {
            var callback = function(doc) {
                var result = new Object();
                result.status = 'sukses';
                result.pendek = appUrl + '/' + doc._id;
                logger.debug('Encoded url ' + _url + ' to code ' + doc._id);
                res.send(JSON.stringify(result), 200);
            };
            pranala.encode(_url, callback);
        } else {
            var result = new Object();
            result.status = 'gagal';
            result.pesan = texts['error_' + error];
            res.send(JSON.stringify(result), 200);
        }

    } else {
	    if (error === null) {
	        var callback = function(doc) {
	            logger.debug('Encoded url ' + _url + ' to code ' + doc._id);
	            res.send(appUrl + '/' + doc._id, 200);
	        };
	        pranala.encode(_url, callback);
	    } else {
	        res.send('', 200);
	    }
    }
}

// expand API
app.get('/v0/panjangkan', function(req, res) {
    var _url = url.sanitise(decodeURIComponent(req.query.pendek));
    var error = url.validateShort(_url, appUrl);
    var regex = new RegExp(appUrl + '/', 'g');
    if (req.query.format === 'json') {
        if (error === null) {
            var code = _url.replace(regex, '');
            var callback = function(doc) {
	            if (doc === null) {
		            var result = new Object();
		            result.status = 'gagal';
		            result.pesan = texts['error_notshortened'];
		            res.send(JSON.stringify(result), 200);
		        } else {
	                var result = new Object();
	                result.status = 'sukses';
	                result.panjang = doc.url;
		            logger.debug('Decoded code ' + code + ' to url ' + doc.url);
	                res.send(JSON.stringify(result), 200);
	            }
            };
            pranala.decode(code, callback);
        } else {
            var result = new Object();
            result.status = 'gagal';
            result.pesan = texts['error_' + error];
            res.send(JSON.stringify(result), 200);
        }
    } else {
	    if (error === null) {
	        var code = _url.replace(regex, '');
	        var callback = function(doc, error) {
	            if (doc === null) {
		            res.send('', 200);
		        } else {
	                logger.debug('Decoded code ' + code + ' to url ' + doc.url);
	                res.send(doc.url, 200);
                }
	        };
	        pranala.decode(code, callback);
	    } else {
	        res.send('', 200);
	    }
    }
});

// mobile page
app.get('/m', function(req, res) {
	var url = '';
	var shortenedUrl = '';
    res.render('m.ejs', {
	    layout: false,
        locals: {
            title: texts['title_m'],
            url: '',
            shortenedUrl: ''
        }
    });
});
app.post('/m', function(req, res) {
    var url = req.body.url;
    if (url) {
	    var callback = function(doc) {
	        logger.debug('Encoded url ' + url + ' to code ' + doc._id);
		    res.render('m.ejs', {
			    layout: false,
		        locals: {
		            title: texts['title_m'],
		            url: url,
		            shortenedUrl: appUrl + '/' + doc._id
		        }
		    });
	    };
	    pranala.encode(url, callback);
	} else {
	    res.render('m.ejs', {
		    layout: false,
	        locals: {
	            title: texts['title_m'],
	            url: '',
	            shortenedUrl: ''
	        }
	    });		
	}
});

// pre-verification test
app.get('/u/pvt', function(req, res) {
    res.render('pvt.ejs', {
	    layout: false,
        locals: {
            appUrl: appUrl
        }
    });
});

// decode a short URL, then redirect to long URL
app.get('/:code', function(req, res) {
    var callback = function(doc) {
        if (doc === null) {
		    res.render('takada.ejs', {
		        locals: {
		            title: texts['title_takada']
		        }
		    });
        } else {
	        var url = doc.url;
            logger.debug('Decoded code ' + req.params.code + ' to url ' + url);
            var callback = function(doc) {
	            res.redirect(url);
            }
            pranala.stat(req.params.code, url, 'pancanaka', req.headers.referer, callback);
        }
    };
    pranala.decode(req.params.code, callback);
});

// error handling
function NotFound(message) {
    this.name = 'NotFound';
    Error.call(this, message);
    Error.captureStackTrace(this, arguments.callee);
}
sys.inherits(NotFound, Error);
app.get('/500', function(req, res) {
    throw new Error('Ngantuk, jadi error deh.');
});
app.get('/*', function(req, res) {
    throw new NotFound;
});

logger.info('Starting application in ' + env + ' environment on port ' + appPort);
app.listen(appPort);

exports.logger = logger;