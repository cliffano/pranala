var assetManager = require('connect-assetmanager'),
    assetHandler = require('connect-assetmanager-handlers'),
    connect = require('connect'),
    express = require('express'),
	log4js = require('log4js'),
    Pranala = require('./lib/pranala').Pranala,
    sys = require('sys'),
    url = require('./lib/pranala/url');

// TODO: extract config to conf json
var logger = log4js.getLogger('app'),
    appHost = process.env['PRANALA_APPHOST'],
    dbHost = 'http://localhost:5984',
    dbName = 'pranala',
    sequenceFile = '/var/www/data/pranala-seq',
    logFile = '/var/www/logs/pranala.log',
    pranala = new Pranala(dbHost, dbName, sequenceFile);

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
                assetHandler.yuiCssOptimize,
                assetHandler.fixVendorPrefixes,
                assetHandler.fixGradients,
                assetHandler.stripDataUrlsPrefix
            ],
            '^': [
                assetHandler.yuiCssOptimize,
                assetHandler.fixVendorPrefixes,
                assetHandler.fixGradients,
                assetHandler.replaceImageRefToBase64(root)
            ]
        }
    }
};

var app = express.createServer();

logger.info('Configuring application');
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
	log4js.addAppender(log4js.fileAppender(logFile), 'app');
});
app.configure('development', function() {
    app.set('reload views', 1000);
    app.use('/', connect.errorHandler({ dumpExceptions: true, showStack: true }));
	log4js.addAppender(log4js.consoleAppender());
    logger.setLevel('DEBUG');
});
app.configure('production', function() {
    app.use('/', connect.errorHandler()); 
    logger.setLevel('INFO');
});

// TODO move texts to a Connect module
var texts = new Object();
texts['title_404'] = 'Laman tidak ditemukan';
texts['title_500'] = 'Kesalahan bukan pada pesawat televisi anda. Harap dicoba sesaat lagi.';
texts['title_hubungi'] = 'Hubungi kami';
texts['title_home'] = 'Pendekkan pranalanya';
texts['title_carakerja'] = 'Cara kerja';
texts['title_kegunaan'] = 'Kegunaan';
texts['title_alat'] = 'Alat';
texts['title_api'] = 'API';
texts['title_kontribusi'] = 'Kontribusi';
texts['title_m'] = 'Mobile';
texts['title_takada'] = 'Pranala tidak ditemukan';
texts['error_blacklisted'] = 'Lho gan, sepertinya pranalanya sudah dipendekkan ya?';
texts['error_inexistent'] = 'Maaf gan, tolong sediakan pranalanya dahulu.';
texts['error_invalid'] = 'Maaf gan, pranalanya tidak valid.';
texts['error_notshortened'] = 'Pranala pendek yang anda sediakan tidak dapat ditemukan di sistem kami.';

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
            appHost: appHost
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
                result.pendek = appHost + '/' + doc._id;
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
	            res.send(appHost + '/' + doc._id, 200);
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
    var error = url.validateShort(_url, appHost);
    var regex = new RegExp(appHost + '/', 'g');
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
		            shortenedUrl: appHost + '/' + doc._id
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
            appHost: appHost
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

// error
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

logger.info('Starting application');
app.listen(3000);

exports.logger = logger;