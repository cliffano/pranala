APP_NAME = pranala
APP_VERSION = 0.1-SNAPSHOT
APP_FULLNAME = $(APP_NAME)-$(APP_VERSION)
BUILD_BASE = build
BUILD_LINT = $(BUILD_BASE)/lint
BUILD_PACKAGE = $(BUILD_BASE)/package
BUILD_TEST = $(BUILD_BASE)/test
DATA_DIR = /var/www/data
DB_APP = localhost:5984/$(APP_NAME)
DB_TEST = localhost:5984/$(APP_NAME)_test
DEPLOY_HOST = ayame
DEPLOY_PORT = 2218
DEPLOY_DIR = /var/www/prn.la/www

init:
	echo "B0b shall build."

clean:
	rm -rf $(BUILD_BASE)
	rm $(DATA_DIR)/$(APP_NAME)-seq
	$(call db-delete, $(DB_APP))
	$(call db-delete, $(DB_TEST))
	
db-create = curl -X PUT $(1); \
	curl -X PUT --data-binary @db/_design/content.json $(1)/_design/content; \
	curl -X PUT --data-binary @db/22.json $(1)/22; \
	curl -X PUT --data-binary @db/23.json $(1)/23
	
db-delete = curl -X DELETE $(1)

db-app:
	$(call db-create, $(DB_APP))
		
db-test:
	$(call db-create, $(DB_TEST))
		
lint:

coverage:

test-vows:
	mkdir -p $(BUILD_TEST)
	vows test/vows/*

start-app-dev:
	./pranala-dev.sh

package:
	mkdir -p $(BUILD_PACKAGE)
	tar --exclude test --exclude .svn -cvf $(BUILD_PACKAGE)/$(APP_FULLNAME).tar *
	gzip $(BUILD_PACKAGE)/$(APP_FULLNAME).tar
	
deploy:
	ssh -p $(DEPLOY_PORT) $(DEPLOY_HOST) 'cd $(DEPLOY_DIR); rm -rf *;'
	scp -P $(DEPLOY_PORT) $(BUILD_PACKAGE)/$(APP_FULLNAME).tar.gz $(DEPLOY_HOST):$(DEPLOY_DIR)
	ssh -p $(DEPLOY_PORT) $(DEPLOY_HOST) 'cd $(DEPLOY_DIR); gunzip *.tar.gz; tar -xvf *.tar; ./pranala-restart.sh;' 
