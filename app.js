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
texts['title_takada'] = 'Pranala tidak ditemukan';
texts['error_blacklisted'] = 'Lho gan, sepertinya pranalanya sudah dipendekkan ya?';
texts['error_inexistent'] = 'Maaf gan, tolong sediakan pranalanya dahulu';
texts['error_invalid'] = 'Maaf gan, pranalanya tidak valid';

var dbHost = 'http://localhost:5984';
var dbName = 'pranala';
var sequenceFile = '/var/www/data/pranala-seq';
var pranala = new Pranala(dbHost, dbName, sequenceFile);

app.get('/', function(req, res) {
    res.render('home.ejs', {
        locals: {
            title: texts['title_home']
        }
    });
});
app.get('/b/:page', function(req, res, params) {
    res.render(params.page + '.ejs', {
        locals: {
            title: texts['title_' + params.page]
        }
    });
});
app.get('/e', function(req, res) {
    var result = new Object();
    result.status = 'fail';
    result.message = texts['error_invalid'];
    res.send(JSON.stringify(result), 200);
});
app.get('/e/:url', function(req, res, params) {
    var _url = url.sanitise(decodeURIComponent(params.url));
    var error = url.validate(_url);
    if (error === null) {
        var self = this;
        var callback = function(doc) {
            var result = new Object();
            result.status = 'success';
            result.doc = doc;
            sys.puts('Encoded url ' + _url + ' to code ' + doc._id);
            res.send(JSON.stringify(result), 200);
        };
        pranala.encode(_url, callback);
    } else {
        var result = new Object();
        result.status = 'fail';
        result.message = texts['error_' + error];
        res.send(JSON.stringify(result), 200);
    }
});
app.get('/:code', function(req, res, params) {
    var self = this;
    var callback = function(doc) {
        if (doc === null) {
		    res.render('takada.ejs', {
		        locals: {
		            title: texts['title_takada']
		        }
		    });
        } else {
            sys.puts('Decoded code ' + params.code + ' to url ' + doc.url);
            res.redirect(doc.url);
        }
    };
    pranala.decode(params.code, callback);
});

/*
process.on('exit', function () {
    sys.log('Intercepting exit call');
    pranala.persist();
});
process.on('uncaughtException', function (error) {
    sys.log('Intercepting uncaught exception, error ' + error);
    pranala.persist();
});
process.on('SIGINT', function () {
    sys.log('Detecting SIGINT');
    pranala.persist();
});
process.on('SIGKILL', function () {
    sys.log('Detecting SIGKILL');
    pranala.persist();
});
*/

app.listen(3000);