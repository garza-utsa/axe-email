#!/usr/bin/env node
var nconf = require("nconf");
var lo = require("lodash");
var winston = require("winston");
var commander = require("commander");
var colors = require('colors/safe');
var request = require('superagent');
var axeHandler = require("./lib/axe-handler");
var util = require("./lib/util");
var fs = require('fs');

//var updateAsset = require("./lib/update-asset");
//var util = require("./lib/util");
var logOpts = {
  module: colors.green("index.js")
};

nconf.file('config.json');
winston.cli();
winston.level = 'info';

var mode = "test";
var test = nconf.get("test")
var ws = nconf.get("ws")
var promise = Promise.resolve(null);
var violationTmpl = "app/tmpl/violation.tmpl";
winston.info("processing START");

var target = test['sitemap'];

var bodybuffer = "<html><head><title>violation report</title></head><body>";

request.get(target)
  .set('accept', 'json')
  .end(function(err, res) {
    if (err || !res.ok) {
      winston.error(err, logOpts);
    }
    var response = res.body;
    var site_name = 'site://' + response['site_name'];
    var site_url = 'http:' + response['site_url'];
    var cts = response['contentTypes'];
    winston.info(response['site_name'], logOpts);
    cts.map(function (type) {
      var pages = type['pages'];
      pages.map(function (page) {
        var pageName = page['asset-name'];
        var pageTitle = page['asset-title'];
        var pageLink = page['asset-link'] + ".html";
        var url = pageLink.replace(site_name, site_url);
        promise = axeHandler(url).then(function(axeResults) {
          if (axeResults) {
            var violations = axeResults['violations'];
            var violationsStr = JSON.stringify(violations, null, 2);
            fs.writeFileSync("violation-example.json", violationsStr);

            bodybuffer = bodybuffer + "<h3>" + pageLink;
            bodybuffer = bodybuffer + " - " + pageTitle + "- ";
            bodybuffer = bodybuffer + violations.length + " violations found</h3>";
            winston.info("got results for url " + url, logOpts);
            violations.map(function (v) {
              bodybuffer = bodybuffer + util.generateFromTemplate({"v": v, "url": pageLink}, violationTmpl);
            });
            bodybuffer = bodybuffer + "<hr/>";
          }
        });
      });
    });
    bodybuffer = bodybuffer + "</body></html>";

    return promise.then(function() {
      fs.writeFileSync("app/report-simple.html", bodybuffer);
      winston.info("processing COMPLETE", {module: colors.red("index.js")});
      process.exit(1);
    });
  });

/*
var years = [2016];
var types = ["spotlights"];
var months = [7, 8, 9, 10, 11, 12];

connection.connect(function(err) {
  var promise = Promise.resolve(null);
  var updates = [];

  years.map(function(year) {
    types.map(function(type) {
      months.map(function(month){
        promise = promise.then(function() {
          return updateAsset(year, month, connection, type);
        }).then(function(updateResult) {
          if (updateResult["success"]) {
            winston.info(year, month, type + " update assets COMPLETE", logOpts);
          } else {
            winston.error("success key not found", logOpts);
          }
        });
      });
    });
  });

  return promise.then(function() {
    winston.info("processing DONE", {module: colors.red("index.js")});
    process.exit(1);
  })
});
*/
