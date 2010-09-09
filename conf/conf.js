var assetHandler = require('connect-assetmanager-handlers');

exports.conf = {
    "env": {
	    "dev": {
	        "appUrl": "http://localhost:3000",
	        "appPort": 3000,
	        "dbUrl": "http://localhost:5984",
			"dbName": "pranala",
			"sequenceFile": "/var/www/data/pranala-seq",
			"logFile": "/var/www/logs/pranala.log",
			"logLevel": "DEBUG"
	    },
	    "prd": {
	        "appUrl": "http://prn.la",
	        "appPort": 3000,
	        "dbUrl": "http://localhost:5984",
			"dbName": "pranala",
			"sequenceFile": "/var/www/data/pranala-seq",
			"logFile": "/var/www/logs/pranala.log",
			"logLevel": "INFO"
	    }
    }
}

exports.assetManagerGroups = {
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