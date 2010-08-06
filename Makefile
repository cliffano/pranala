APP_NAME = pranala
APP_VERSION = 0.1-SNAPSHOT
APP_FULLNAME = $(APP_NAME)-$(APP_VERSION)
BUILD_BASE = build
BUILD_LINT = $(BUILD_BASE)/lint
BUILD_PACKAGE = $(BUILD_BASE)/package
BUILD_TEST = $(BUILD_BASE)/test
DB_APP = localhost:5984/$(APP_NAME)
DB_TEST = localhost:5984/$(APP_NAME)_test

init:
	echo "B0b shall build."

clean:
	rm -rf $(BUILD_BASE)
	rm /var/www/data/pranala-seq

db-create = curl -X PUT $(1); \
	curl -X PUT --data-binary @db/_design/content.json $(1)/_design/content

db-delete = curl -X DELETE $(1)

db-app:
	$(call db-delete, $(DB_APP))
	$(call db-create, $(DB_APP))
	
db-test:
	$(call db-delete, $(DB_TEST))
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
	scp -P 2218 $(BUILD_PACKAGE)/$(APP_FULLNAME).tar.gz ayame:/var/www/prn.la/www
	ssh -p 2218 ayame 'cd /var/www/prn.la/www; gunzip *.tar.gz; tar -xvf *.tar; rm *.tar;' 
