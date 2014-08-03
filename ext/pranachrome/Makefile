APP_NAME = pranachrome
APP_VERSION = 0.2
APP_FULLNAME = $(APP_NAME)-$(APP_VERSION)
BUILD_BASE = build
BUILD_PACKAGE = $(BUILD_BASE)/package
SOURCE_DIR = src

clean:
	rm -rf $(BUILD_BASE)

package:
	mkdir -p $(BUILD_PACKAGE)
	cd $(SOURCE_DIR); zip -r ../$(BUILD_PACKAGE)/$(APP_FULLNAME).zip *.* images/*.*

.PHONY: clean package
