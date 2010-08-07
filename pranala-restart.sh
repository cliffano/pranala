#! /bin/sh

cd /var/www/prn.la/www
ps -ef | sed -n '/node pranala-app.js/{/grep/!p;}' | awk '{print$2}' | xargs -i kill {}
rm *.tar
nohup ./pranala-prd.sh&