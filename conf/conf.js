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
};