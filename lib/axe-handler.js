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
var violationTmpl = "app/tmpl/violation.tmpl";

nconf.file('config.json');
winston.cli();

module.exports = function(url) {
  var promise = Promise.resolve(null);
  //winston.info("handling url: " + url, logOpts);

  return new Promise(function (resolve, reject) {
    driver.get(url).then(function () {
        AxeBuilder(driver).analyze(function (results) {
          var resultsBuffer = "";
          //console.log(results);
          if (results) {
            var violations = results['violations'];
            resultsBuffer = resultsBuffer + "<h3>" + url;
            resultsBuffer = resultsBuffer + " " + violations.length + " violations found</h3>";
            //winston.info("got results for url " + url, logOpts);
            resultsBuffer = resultsBuffer + '<ol>';
            violations.map(function (v) {
              resultsBuffer = resultsBuffer + '<li>';
              resultsBuffer = resultsBuffer + util.generateFromTemplate({"v": v, "url": url}, violationTmpl);
              resultsBuffer = resultsBuffer + '</li>';
            });
            resultsBuffer = resultsBuffer + '</ol>';
            resultsBuffer = resultsBuffer + "<hr/>";
            resolve(resultsBuffer);
          } else {
            winston.error("axebuilder failed to return results for url: " + url, logOpts);
            reject("unable to pass axe results");
          }
        });
    });
  });
};
