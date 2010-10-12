#! /bin/sh

NAME="Pranala";
FILE="pranala-app.js";

case $1 in
"start")
    echo "Starting $NAME in $2 environment";
	ENV=$2 nohup node $FILE > nohup.out 2> nohup.err < /dev/null &;;
"stop")
	pid=`ps -ef | sed -n '/node pranala-app.js/{/grep/!p;}' | awk '{print$2}'`;
	echo "Stopping $NAME with process ID $pid";
        kill -9 "$pid";;
"status")
    pid=`ps -ef | sed -n '/node pranala-app.js/{/grep/!p;}' | awk '{print$2}'`;
    if [ -z $pid ]
    then
        echo "$NAME is not running."
    else
        echo "$NAME is running on process ID $pid."
    fi;;
*)
    echo "Usage ./ghibli.sh <start|stop> <dev|prd>";;
esac
