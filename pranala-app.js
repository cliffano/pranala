var connect = require('connect');
var express = require('express');
var Pranala = require('./lib/pranala').Pranala;
var sys = require('sys');
var url = require('./lib/pranala/url');

var app = express.createServer();

app.configure(function() {
    app.set('views', __dirname + '/views');
    app.use('/', connect.bodyDecoder());
    app.use('/', connect.methodOverride());
    app.use('/b/images', connect.staticProvider(__dirname + '/public/images'));
    app.use('/b/scripts', connect.staticProvider(__dirname + '/public/scripts'));
    app.use('/b/styles', connect.staticProvider(__dirname + '/public/styles'));
});
app.configure('development', function() {
    app.set('reload views', 1000);
    app.use('/', connect.errorHandler({ dumpExceptions: true, showStack: true })); 
});
app.configure('production', function() {
    app.use('/', connect.errorHandler()); 
});

// TODO move texts to a Connect module
var texts = new Object();
texts['title_404'] = 'Laman tidak ditemukan';
texts['title_hubungi'] = 'Hubungi kami';
texts['title_home'] = 'Pendekkan pranalanya';
texts['title_carakerja'] = 'Cara kerja';
texts['title_kegunaan'] = 'Kegunaan';
texts['title_alat'] = 'Alat';
texts['title_api'] = 'API';
texts['title_poster'] = 'Poster';
texts['title_mobile'] = 'Mobile';
texts['title_takada'] = 'Pranala tidak ditemukan';
texts['error_blacklisted'] = 'Lho gan, sepertinya pranalanya sudah dipendekkan ya?';
texts['error_inexistent'] = 'Maaf gan, tolong sediakan pranalanya dahulu.';
texts['error_invalid'] = 'Maaf gan, pranalanya tidak valid.';
texts['error_notshortened'] = 'Pranala pendek yang anda sediakan tidak dapat ditemukan di sistem kami.';

var appHost = process.env['PRANALA_APPHOST'];
var dbHost = 'http://localhost:5984';
var dbName = 'pranala';
var sequenceFile = '/var/www/data/pranala-seq';
var pranala = new Pranala(dbHost, dbName, sequenceFile);

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

// shorten API
app.get('/v0/pendekkan', function(req, res) {
    var _url = url.sanitise(decodeURIComponent(req.query.panjang));
    var error = url.validate(_url);
    if (req.query.format === 'teks') {
	    if (error === null) {
	        var callback = function(doc) {
	            sys.puts('Encoded url ' + _url + ' to code ' + doc._id);
	            res.send(appHost + '/' + doc._id, 200);
	        };
	        pranala.encode(_url, callback);
	    } else {
	        res.send('', 200);
	    }
    } else {
        if (error === null) {
            var callback = function(doc) {
                var result = new Object();
                result.status = 'sukses';
                result.pendek = appHost + '/' + doc._id;
                sys.puts('Encoded url ' + _url + ' to code ' + doc._id);
                res.send(JSON.stringify(result), 200);
            };
            pranala.encode(_url, callback);
        } else {
            var result = new Object();
            result.status = 'gagal';
            result.pesan = texts['error_' + error];
            res.send(JSON.stringify(result), 200);
        }
    }
});

// expand API
app.get('/v0/panjangkan', function(req, res) {
    var _url = url.sanitise(decodeURIComponent(req.query.pendek));
    var error = url.validateShort(_url, appHost);
    var regex = new RegExp(appHost + '/', 'g');
    if (req.query.format === 'teks') {
	    if (error === null) {
	        var code = _url.replace(regex, '');
	        var callback = function(doc) {
	            sys.puts('Decoded code ' + code + ' to url ' + doc.url);
	            res.send(doc.url, 200);
	        };
	        pranala.decode(code, callback);
	    } else {
	        res.send('', 200);
	    }
    } else {
        if (error === null) {
            var code = _url.replace(regex, '');
            var callback = function(doc) {
                var result = new Object();
                result.status = 'sukses';
                result.panjang = doc.url;
	            sys.puts('Decoded code ' + code + ' to url ' + doc.url);
                res.send(JSON.stringify(result), 200);
            };
            pranala.decode(code, callback);
        } else {
            var result = new Object();
            result.status = 'gagal';
            result.pesan = texts['error_' + error];
            res.send(JSON.stringify(result), 200);
        }
    }
});

// mobile page
app.get('/m', function(req, res) {
	var url = '';
	var shortenedUrl = '';
    res.render('mobile.ejs', {
	    layout: false,
        locals: {
            title: texts['title_mobile'],
            url: '',
            shortenedUrl: ''
        }
    });
});
app.post('/m', function(req, res) {
    var url = req.body.url;
    if (url) {
	    var callback = function(doc) {
	        sys.puts('Encoded url ' + url + ' to code ' + doc._id);
		    res.render('mobile.ejs', {
			    layout: false,
		        locals: {
		            title: texts['title_mobile'],
		            url: url,
		            shortenedUrl: appHost + '/' + doc._id
		        }
		    });
	    };
	    pranala.encode(url, callback);
	} else {
	    res.render('mobile.ejs', {
		    layout: false,
	        locals: {
	            title: texts['title_mobile'],
	            url: '',
	            shortenedUrl: ''
	        }
	    });		
	}
});

// pre-verification test
app.get('/t/pvt', function(req, res) {
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
            sys.puts('Decoded code ' + req.params.code + ' to url ' + doc.url);
            res.redirect(doc.url);
        }
    };
    pranala.decode(req.params.code, callback);
});

app.listen(3000);