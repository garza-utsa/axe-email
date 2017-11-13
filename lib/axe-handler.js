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
var violationsTmpl = "app/tmpl/violations.tmpl";

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
            var vSrc = [];
            var count = violations.length;

            violations.map(function (v) {
              var src = util.generateFromTemplate({"v": v, "url": url}, violationTmpl);
              vSrc.push(src);
            });
            resultsBuffer = util.generateFromTemplate({
              "count": count,
              "url": url,
              "violations": vSrc
            }, violationsTmpl);
            resolve(resultsBuffer);
          } else {
            winston.error("axebuilder failed to return results for url: " + url, logOpts);
            reject("unable to pass axe results");
          }
        });
    });
  });
};
