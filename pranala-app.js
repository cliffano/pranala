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
texts['title_takada'] = 'Pranala tidak ditemukan';
texts['error_blacklisted'] = 'Lho gan, sepertinya pranalanya sudah dipendekkan ya?';
texts['error_inexistent'] = 'Maaf gan, tolong sediakan pranalanya dahulu.';
texts['error_invalid'] = 'Maaf gan, pranalanya tidak valid.';

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

app.get('/v1/pendekkan', function(req, res) {
    var _url = url.sanitise(decodeURIComponent(req.query.panjang));
    var error = url.validate(_url);
    if (req.query.format === 'teks') {
	    if (error === null) {
	        var self = this;
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
            var self = this;
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

// decode a short URL
app.get('/:code', function(req, res) {
    var self = this;
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