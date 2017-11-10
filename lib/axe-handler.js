var nconf = require("nconf");
//var templator = require("./templator");
var lo = require("lodash");
var winston = require("winston");
var AxeBuilder = require('axe-webdriverjs');
var WebDriver = require('selenium-webdriver');
var util = require('./util.js');

var driver = new WebDriver.Builder()
  .forBrowser('chrome')
  .build();

var colors = require('colors/safe');
var logOpts = {
  module: colors.green("axe-handler.js")
};
nconf.file('config.json');
winston.cli();

module.exports = function(url) {
  var promise = Promise.resolve(null);
  winston.info("handling url: " + url, logOpts);

  return new Promise(function (resolve, reject) {
    driver.get(url).then(function () {
        AxeBuilder(driver).analyze(function (results) {
          //console.log(results);
          resolve(results);
          //return results;
        });
    });
  });
};
