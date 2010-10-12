exports.conf = {
    "env": {
	    "dev": {
	        "appUrl": "http://localhost:9300",
	        "appPort": 9300,
	        "dbUrl": "http://localhost:5984",
			"dbName": "pranala",
			"sequenceFile": "/var/www/data/pranala-seq",
			"logFile": "/var/www/logs/pranala.log",
			"logLevel": "DEBUG"
	    },
	    "prd": {
	        "appUrl": "http://prn.la",
	        "appPort": 9300,
	        "dbUrl": "http://localhost:5984",
			"dbName": "pranala",
			"sequenceFile": "/var/www/data/pranala-seq",
			"logFile": "/var/www/logs/pranala.log",
			"logLevel": "INFO"
	    }
    }
};
