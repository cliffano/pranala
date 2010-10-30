APP_NAME = pranala
APP_VERSION = 0.1-SNAPSHOT
APP_FULLNAME = $(APP_NAME)-$(APP_VERSION)
BUILD_BASE = build
BUILD_LINT = $(BUILD_BASE)/lint
BUILD_PACKAGE = $(BUILD_BASE)/package
BUILD_TEST = $(BUILD_BASE)/test
CONF_DIR = conf
DATA_DIR = /var/www/data
DB_APP = localhost:5984/$(APP_NAME)
DB_TEST = localhost:5984/$(APP_NAME)_test
DEPLOY_HOST = teuchi
DEPLOY_PORT = 2218
DEPLOY_DIR = /var/www/prn.la/www
LOGS_DIR = /var/www/logs

init:
	echo "B0b shall build."

clean:
	rm -rf $(BUILD_BASE)
	rm -f $(DATA_DIR)/$(APP_NAME)-seq
	rm -f $(LOGS_DIR)/$(APP_NAME).log
	rm -f nohup.*
	$(call db-delete, $(DB_APP))
	$(call db-delete, $(DB_TEST))
	
db-create = curl -X PUT $(1); \
	curl -X PUT --data-binary @db/_design/content.json $(1)/_design/content; \
	curl -X PUT --data-binary @db/22.json $(1)/22; \
	curl -X PUT --data-binary @db/23.json $(1)/23; \
	curl -X PUT --data-binary @db/5158d26a2f6a4747515983fd8a008dd8.json $(1)/5158d26a2f6a4747515983fd8a008dd8; \
	curl -X PUT --data-binary @db/5158d26a2f6a4747515983fd8a00912e.json $(1)/5158d26a2f6a4747515983fd8a00912e; \
	curl -X PUT --data-binary @db/5158d26a2f6a4747515983fd8a0093d2.json $(1)/5158d26a2f6a4747515983fd8a0093d2
	
db-delete = curl -X DELETE $(1)

db-app:
	$(call db-create, $(DB_APP))
		
db-test:
	$(call db-create, $(DB_TEST))
		
lint:
	mkdir -p $(BUILD_LINT)
	nodelint --config $(CONF_DIR)/lint.js --reporter $(CONF_DIR)/lintreporter.js pranala-app.js lib/ | tee $(BUILD_LINT)/jslint.xml

test-vows: clean db-test
	mkdir -p $(BUILD_TEST)
	ENV=dev vows test/vows/*

test-ab: clean stop start-dev
	sysctl -w kern.maxproc=10000

dep:
	npm install express connect-assetmanager connect-assetmanager-handlers ejs log4js vows nodelint node-inspector

start-dev: clean db-app
	echo "0" > $(DATA_DIR)/pranala-seq
	./ghibli.sh start dev

stop:
	./ghibli.sh stop

status:
	./ghibli.sh status
    
package: clean
	mkdir -p $(BUILD_PACKAGE)
	tar --exclude test --exclude .svn --exclude ._* -cvf $(BUILD_PACKAGE)/$(APP_FULLNAME).tar *
	gzip $(BUILD_PACKAGE)/$(APP_FULLNAME).tar
	
deploy: clean package
	ssh -p $(DEPLOY_PORT) $(DEPLOY_HOST) 'cd $(DEPLOY_DIR); rm -rf *;'
	scp -P $(DEPLOY_PORT) $(BUILD_PACKAGE)/$(APP_FULLNAME).tar.gz $(DEPLOY_HOST):$(DEPLOY_DIR)
	ssh -p $(DEPLOY_PORT) $(DEPLOY_HOST) 'cd $(DEPLOY_DIR); gunzip *.tar.gz; tar -xvf *.tar; rm *.tar; ./ghibli.sh stop; ./ghibli.sh start prd;'
	
.PHONY: init clean db-app db-test lint test start-dev stop package deploy 
