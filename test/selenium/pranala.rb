#!/usr/bin/env ruby
#
# Sample Ruby script using the Selenium client API
#
require "rubygems"
gem "selenium-client", ">=1.2.16"
require "selenium/client"

begin
    @browser = Selenium::Client::Driver.new \
        :host => "localhost",
        :port => 4444,
        :browser => "*firefox",
        :url => "http://localhost:3000",
        :timeout_in_second => 60

    @browser.start_new_browser_session
    @browser.open "/"
ensure
    #@browser.close_current_browser_session
end
