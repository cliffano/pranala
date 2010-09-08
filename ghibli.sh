#! /bin/sh

case $1 in
"start")
    echo "Starting Pranala in $2 environment";
	PRANALA_ENV=$2 nohup node pranala-app.js > nohup.out 2> nohup.err < /dev/null &;;
"stop")
	pid=`ps -ef | sed -n '/node pranala-app.js/{/grep/!p;}' | awk '{print$2}'`;
	echo "Stopping Pranala with process ID $pid"
	kill "$pid";;
*)
    echo "Usage ./ghibli.sh <start|stop> <dev|prd>";;
esac