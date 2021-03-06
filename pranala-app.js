var assetManager = require('connect-assetmanager'),
    assetHandler = require('connect-assetmanager-handlers'),
    connect = require('connect'),
    express = require('express'),
    fs = require('fs'),
    log4js = require('log4js')(),
    conf = JSON.parse(fs.readFileSync('./app.conf', 'utf-8')),
    Pranala = require('./lib/pranala').Pranala,
    sys = require('sys'),
    Url = require('./lib/pranala/url').Url;

var logger = log4js.getLogger('app'),
    env = process.env.ENV,
    pranala = new Pranala(conf.db, conf.app.sequence, 'text'),
	url = new Url(conf.app.shorteners, conf.app.blacklist),
    global = {
        env: env,
        uniqueId: (new Date()).getTime(),
        p: pranala,
        nav: [ 'hotlinks', 'tools', 'api', 'contact' ]
    };
    
log4js.addAppender(log4js.fileAppender(conf.log.file), 'app');
logger.setLevel(conf.log.level);

var app = express.createServer();
var getLang = function (req) {
    if (req.session.lang === undefined) {
        var acceptLang = req.headers['accept-language'];
        req.session.lang = (acceptLang && acceptLang.match(/^'+id/)) ? 'id' : 'en';
    }
    return req.session.lang;
};
function NotFound(message) {
    this.name = 'NotFound';
    Error.call(this, message);
    //Error.captureStackTrace(this, arguments.callee);
}

logger.info('Configuring application');
var assetManagerGroups = {
    'js': {
        'route': /\/b\/scripts\/pranala\.js/,
        'path': './public/scripts/',
        'dataType': 'javascript',
        'files': ['jquery-min-1.4.2.js', 'json2.js', 'global.js']
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
    app.use(express.conditionalGet());
    app.set('views', __dirname + '/views');
    app.use(express.bodyDecoder());
    app.use(express.methodOverride());
    app.use('/b/images', express.staticProvider(__dirname + '/public/images'));
    app.use(express.cookieDecoder());
	app.use(express.session({ secret: 'pancanaka' }));
    app.use(express.gzip());
    app.use(assetManager(assetManagerGroups));
    app.register('.html', require('ejs'));
	app.error(function (error, req, res, next) {
	    if (error instanceof NotFound) {
		    res.render('404.html', {
		        locals: {
			        g: global,
			        lang: getLang(req),
		            page: '404'
		        },
		        status: 404
		    });
	    } else {
		    logger.error(error.message);
		    res.render('500.html', {
		        locals: {
			        g: global,
			        lang: getLang(req),
		            page: '500'
		        },
		        status: 500
		    });
	    }
	});
});
app.configure('dev', function () {
    app.set('reload views', 1000);
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});
app.configure('prd', function () {
    app.use(express.errorHandler());
});

logger.info('Setting up routers');

// home page
app.get('/', function (req, res) {
	var url = req.query.pranala || 'http://';
    res.render('home.html', {
        locals: {
	        g: global,
	        lang: getLang(req),
            page: 'home',
            url: url
        }
    });
});

// hotlinks page
app.get('/b/:lang/hotlinks', function (req, res) {
    var type = req.query.type || 'week',
	    callback = function (docs) {
	    res.render('hotlinks.html', {
	        locals: {
		        g: global,
		        lang: req.params.lang,
	            page: 'hotlinks',
	            docs: docs,
	            type: type,
	            types: [ 'week', 'month', 'all', 'day' ]
	        }
	    });
	};
    pranala.hotlinks(type, callback);
});

// brochure pages
app.get('/b/:lang/:page', function (req, res) {
    res.render(req.params.page + '.html', {
        locals: {
	        g: global,
	        lang: req.params.lang,
            page: req.params.page,
            appUrl: conf.app.url
        }
    });
});

// shorten API
var v0Shorten = function (req, res) {
    var _url = url.sanitise(req.query.long || req.query.prn || ''),
        error = url.validateLong(_url),
        callback, result;
    if (req.query.format === 'json') {
        if (error === null) {
            callback = function (doc) {
                result = {};
                result.status = 'success';
                result.short = conf.app.url + '/' + doc._id;
                logger.debug('Encoded url ' + _url + ' to code ' + doc._id);
                res.send(JSON.stringify(result), 200);
            };
            pranala.encode(_url, callback);
        } else {
            result = {};
            result.status = 'failure';
            result.message = error;
            res.send(JSON.stringify(result), 200);
        }

    } else {
	    if (error === null) {
	        callback = function (doc) {
	            logger.debug('Encoded url ' + _url + ' to code ' + doc._id);
	            res.send(conf.app.url + '/' + doc._id, 200);
	        };
	        pranala.encode(_url, callback);
	    } else {
	        res.send('', 200);
	    }
    }
};
app.get('/v0/shorten', function (req, res) {
    v0Shorten(req, res);
});

// expand API
app.get('/v0/expand', function (req, res) {
    var _url = url.sanitise(decodeURIComponent(req.query.short)),
        code = _url.replace(/^https?:\/\/.*\//, ''),
        error = url.validateShort(code),
        callback, result;
    if (req.query.format === 'json') {
        if (error === null) {
            callback = function (doc) {
	            if (doc === null) {
		            result = {};
		            result.status = 'failure';
		            result.message = 'NOT_FOUND';
		            res.send(JSON.stringify(result), 200);
		        } else {
	                result = {};
	                result.status = 'success';
	                result.long = doc.url;
		            logger.debug('Decoded code ' + code + ' to url ' + doc.url);
	                res.send(JSON.stringify(result), 200);
	            }
            };
            pranala.decode(code, callback);
        } else {
            result = {};
            result.status = 'failure';
            result.message = error;
            res.send(JSON.stringify(result), 200);
        }
    } else {
	    if (error === null) {
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

// custom API
app.get('/v0/custom', function (req, res) {
    var _url = url.sanitise(req.query.long || ''),
        code = req.query.code || '',
        error = url.validateLong(_url) || url.validateCustom(code),
        callback, result;
    if (req.query.format === 'json') {
        if (error === null) {
            callback = function (doc) {
                result = {};
                result.status = 'success';
                result.short = conf.app.url + '/' + doc._id;
                logger.debug('Custom url ' + _url + ' with code ' + doc._id);
                res.send(JSON.stringify(result), 200);
            };
            pranala.custom(_url, code, callback);
        } else {
            result = {};
            result.status = 'failure';
            result.message = error;
            res.send(JSON.stringify(result), 200);
        }
    } else {
	    if (error === null) {
	        callback = function (doc) {
	            logger.debug('Custom url ' + _url + ' with code ' + doc._id);
	            res.send(conf.app.url + '/' + doc._id, 200);
	        };
	        pranala.custom(_url, code, callback);
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
    res.redirect(req.query.url, 301);
});

// mobile page
app.get('/m', function (req, res) {
	var url = '',
	    shortenedUrl = '';
    res.render('m.html', {
	    layout: false,
        locals: {
            g: global,
            lang: getLang(req),
            page: 'm',
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
		    res.render('m.html', {
			    layout: false,
		        locals: {
                    g: global,
                    lang: getLang(req),
		            page: 'm',
		            url: url,
		            shortenedUrl: conf.app.url + '/' + doc._id
		        }
		    });
	    };
	    pranala.encode(url, callback);
	} else {
	    res.render('m.html', {
		    layout: false,
	        locals: {
                g: global,
                lang: getLang(req),
	            page: 'm',
	            url: '',
	            shortenedUrl: ''
	        }
	    });		
	}
});

// pre-verification test
app.get('/u/pvt', function (req, res) {
    res.render('pvt.html', {
	    layout: false,
        locals: {
            appUrl: conf.app.url
        }
    });
});

// robots.txt
app.get('/robots.txt', function (req, res) {
    res.render('robots.html', {
        layout: false,
        locals: {
        },
        headers: {
            'content-type': 'text/plain'
        }
    });
});

// sitemap.xml
app.get('/sitemap.xml', function (req, res) {
    res.render('sitemap.html', {
        layout: false,
        locals: {
            appUrl: conf.app.url,
            g: global
        },
        headers: {
            'content-type': 'text/xml'
        }
    });
});

app.get('/:code/qr', function (req, res) {
    var shortUrl = conf.app.url + '/' + req.params.code;
    res.render('qr.html', {
        locals: {
            g: global,
            lang: getLang(req),
            page: 'qr',
            shortUrl: shortUrl,
            qrUrl: 'http://chart.apis.google.com/chart?cht=qr&chs=150x150&chl=' + encodeURIComponent(shortUrl)
        }
    });
});

// decode a short URL, then redirect to long URL
app.get('/:code', function (req, res) {
    var url,
        callback = function (doc) {
        if (doc === null) {
		    res.render('notfound.html', {
		        locals: {
                    g: global,
                    lang: getLang(req),
		            page: 'notfound'
		        }
		    });
        } else {
	        url = doc.url;
            logger.debug('Decoded code ' + req.params.code + ' to url ' + url);
            callback = function (doc) {
	            res.redirect(url, 301);
            };
            // x-real-ip is configured in nginx.conf
            pranala.stat(req.params.code, url, 'arjuna', req.headers['x-real-ip'], req.headers.referer, req.headers['user-agent'], callback);
        }
    };
    pranala.decode(req.params.code, callback);
});

// error handling
process.on('uncaughtException', function (error) {
    logger.error('An unexpected error has occured. ' + sys.inspect(error));
});
sys.inherits(NotFound, Error);
app.get('/500', function (req, res) {
    throw new Error('An unexpected error has occured.');
});
app.get('/*', function (req, res) {
    throw new NotFound();
});

logger.info('Starting ' + conf.app.name + ' on port ' + conf.app.port + ' in env ' + process.env.ENV);
app.listen(conf.app.port);

exports.logger = logger;