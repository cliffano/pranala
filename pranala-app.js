var assetManager = require('connect-assetmanager'),
    assetHandler = require('connect-assetmanager-handlers'),
    conf = require('./conf/conf').conf,
    connect = require('connect'),
    express = require('express'),
    log4js = require('log4js'),
    Pranala = require('./lib/pranala').Pranala,
    sys = require('sys'),
    url = require('./lib/pranala/url');

var logger = log4js.getLogger('app'),
    env = process.env.ENV,
    appConf = conf.env[env],
    appUrl = appConf.appUrl,
    appPort = appConf.appPort,
    dbUrl = appConf.dbUrl,
    dbName = appConf.dbName,
    sequenceFile = appConf.sequenceFile,
    logFile = appConf.logFile,
    logLevel = appConf.logLevel,
    pranala = new Pranala(dbUrl, dbName, sequenceFile, 'conf/text'),
    global = {
        uniqueId: (new Date()).getTime(),
        pranala: pranala,
        nav: [ 'statistik', 'carakerja', 'kegunaan', 'alat', 'api', 'kontribusi', 'hubungi' ]
    };
    
log4js.addAppender(log4js.fileAppender(logFile), 'app');
logger.setLevel(logLevel);

var app = express.createServer();
var getLang = function(req) {
    if (req.session.lang === undefined) {
        req.session.lang = 'id';
    }
    return req.session.lang;
};
function NotFound(message) {
    this.name = 'NotFound';
    Error.call(this, message);
    Error.captureStackTrace(this, arguments.callee);
}

logger.info('Configuring application');
var assetManagerGroups = {
    'js': {
        'route': /\/b\/scripts\/pranala\.js/,
        'path': './public/scripts/',
        'dataType': 'javascript',
        'files': ['jquery-min-1.4.2.js', 'json2.js', 'clipboard.js', 'global.js']
    },
    'css': {
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
app.configure(function () {
    app.set('views', __dirname + '/views');
    app.use('/', connect.bodyDecoder());
    app.use('/', connect.methodOverride());
    app.use('/b/images', connect.staticProvider(__dirname + '/public/images'));
    app.use(assetManager(assetManagerGroups));
    app.use(express.cookieDecoder());
    app.use(express.session());
	app.error(function (error, req, res, next) {
	    if (error instanceof NotFound) {
		    res.render('404.ejs', {
		        locals: {
			        global: global,
			        lang: getLang(req),
		            title: pranala.getText(getLang(req), 'title.404'),
		            message: pranala.getText(getLang(req), 'title.404')
		        },
		        status: 404
		    });
	    } else {
		    logger.error(error.message);
		    res.render('500.ejs', {
		        locals: {
			        global: global,
			        lang: getLang(req),
		            title: pranala.getText(getLang(req), 'title.500'),
		            message: pranala.getText(getLang(req), 'title.500')
		        },
		        status: 500
		    });
	    }
	});
});
app.configure('dev', function () {
    app.set('reload views', 1000);
    app.use('/', connect.errorHandler({ dumpExceptions: true, showStack: true }));
});
app.configure('prd', function () {
    app.use('/', connect.errorHandler());
});

logger.info('Setting up routers');

// home page
app.get('/', function (req, res) {
	var url = req.query.pranala || 'http://';
    res.render('home.ejs', {
        locals: {
	        global: global,
	        lang: getLang(req),
            title: pranala.getText(getLang(req), 'title.home'),
            url: url
        }
    });
});

// statistic page
app.get('/b/statistik', function (req, res) {
	var callback = function (docs) {
		var sys = require('sys');
		sys.puts(sys.inspect(docs));
	    res.render('statistik.ejs', {
	        locals: {
		        global: global,
		        lang: getLang(req),
	            title: pranala.getText(getLang(req), 'title.statistik'),
	            docs: docs
	        }
	    });
	};
    pranala.popular(callback);
});

// brochure pages
app.get('/b/:page', function (req, res) {
    res.render(req.params.page + '.ejs', {
        locals: {
	        global: global,
	        lang: getLang(req),
            title: pranala.getText(getLang(req), 'title.' + req.params.page),
            appUrl: appUrl
        }
    });
});

// shorten API
var v0Shorten = function (req, res) {
    var _url = url.sanitise(decodeURIComponent(req.query.panjang || req.query.prn || '')),
        error = url.validate(_url),
        callback, result;
    if (req.query.format === 'json') {
        if (error === null) {
            callback = function (doc) {
                result = {};
                result.status = 'sukses';
                result.pendek = appUrl + '/' + doc._id;
                logger.debug('Encoded url ' + _url + ' to code ' + doc._id);
                res.send(JSON.stringify(result), 200);
            };
            pranala.encode(_url, callback);
        } else {
            result = {};
            result.status = 'gagal';
            result.pesan = error;
            res.send(JSON.stringify(result), 200);
        }

    } else {
	    if (error === null) {
	        callback = function (doc) {
	            logger.debug('Encoded url ' + _url + ' to code ' + doc._id);
	            res.send(appUrl + '/' + doc._id, 200);
	        };
	        pranala.encode(_url, callback);
	    } else {
	        res.send('', 200);
	    }
    }
};
app.get('/v0/pendekkan', function (req, res) {
    v0Shorten(req, res);
});

// expand API
app.get('/v0/panjangkan', function (req, res) {
    var _url = url.sanitise(decodeURIComponent(req.query.pendek)),
        error = url.validateShort(_url, appUrl),
        regex = new RegExp(appUrl + '/', 'g'),
        code, callback, result;
    if (req.query.format === 'json') {
        if (error === null) {
            code = _url.replace(regex, '');
            callback = function (doc) {
	            if (doc === null) {
		            result = {};
		            result.status = 'gagal';
		            result.pesan = 'TIDAK_DITEMUKAN';
		            res.send(JSON.stringify(result), 200);
		        } else {
	                result = {};
	                result.status = 'sukses';
	                result.panjang = doc.url;
		            logger.debug('Decoded code ' + code + ' to url ' + doc.url);
	                res.send(JSON.stringify(result), 200);
	            }
            };
            pranala.decode(code, callback);
        } else {
            result = {};
            result.status = 'gagal';
            result.pesan = error;
            res.send(JSON.stringify(result), 200);
        }
    } else {
	    if (error === null) {
	        code = _url.replace(regex, '');
	        callback = function (doc, error) {
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

// main form, twitter iphone, wp-prnla
app.get('/x', function (req, res) {
    v0Shorten(req, res);
});

// language
app.get('/l', function (req, res) {
    req.session.lang = req.query.lang;
    res.redirect(req.query.url);
});

// mobile page
app.get('/m', function (req, res) {
	var url = '',
	    shortenedUrl = '';
    res.render('m.ejs', {
	    layout: false,
        locals: {
            title: pranala.getText(getLang(req), 'title.m'),
            url: '',
            shortenedUrl: ''
        }
    });
});
app.post('/m', function (req, res) {
    var url = req.body.url,
        callback;
    if (url) {
	    callback = function (doc) {
	        logger.debug('Encoded url ' + url + ' to code ' + doc._id);
		    res.render('m.ejs', {
			    layout: false,
		        locals: {
		            title: pranala.getText(getLang(req), 'title.m'),
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
	            title: pranala.getText(getLang(req), 'title.m'),
	            url: '',
	            shortenedUrl: ''
	        }
	    });		
	}
});

// pre-verification test
app.get('/u/pvt', function (req, res) {
    res.render('pvt.ejs', {
	    layout: false,
        locals: {
            appUrl: appUrl
        }
    });
});

// decode a short URL, then redirect to long URL
app.get('/:code', function (req, res) {
    var url,
        callback = function (doc) {
        if (doc === null) {
		    res.render('takada.ejs', {
		        locals: {
		            title: pranala.getText(getLang(req), 'title.takada')
		        }
		    });
        } else {
	        url = doc.url;
            logger.debug('Decoded code ' + req.params.code + ' to url ' + url);
            callback = function (doc) {
	            res.redirect(url);
            };
            // x-real-ip is configured in nginx.conf
            pranala.stat(req.params.code, url, 'gatotkaca', req.headers['x-real-ip'], req.headers.referer, req.headers['user-agent'], callback);
        }
    };
    pranala.decode(req.params.code, callback);
});

// error handling
process.on('uncaughtException', function (error) {
    throw new Error('Ngantuk, jadi error deh. ' + sys.inspect(error));
});
sys.inherits(NotFound, Error);
app.get('/500', function (req, res) {
    throw new Error('Ngantuk, jadi error deh.');
});
app.get('/*', function (req, res) {
    throw new NotFound();
});

logger.info('Starting application in ' + env + ' environment on port ' + appPort);
app.listen(appPort);

exports.logger = logger;