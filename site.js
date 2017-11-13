#!/usr/bin/env node
var nconf = require("nconf");
var lo = require("lodash");
var winston = require("winston");
var commander = require("commander");
var colors = require('colors/safe');
var request = require('superagent');
var siteHandler = require("./lib/site-handler");
var util = require("./lib/util");
var fs = require('fs');
var logOpts = {
  module: colors.green("site.js")
};

nconf.file('config.json');
winston.cli();
winston.level = 'info';

var promise = Promise.resolve(null);
var mode = "test";
var test = nconf.get("test")
var ws = nconf.get("ws")
var searchURL = ws['ws_base_url'] + 'search?u=' + ws['username'] + '&p=' + ws['password'];
var searchInfo = {
  "searchInformation" : {
    "searchTerms" : "sitemap",
    "searchFields" : ["name"],
    "searchTypes" : ["page"]
  }
}
var reportTmpl = "app/tmpl/report.tmpl";

var siteResults = [];

winston.info("processing START");

request.post(searchURL).send(searchInfo).set('accept', 'json')
  .end(function(err, res) {
    if (err || !res.ok) {
      winston.error(err, logOpts);
    } else {
      var searchResponse = res.body;
      var matches = searchResponse['matches'];
      winston.info("sitemaps found: " + matches.length, logOpts);
      if (matches.length > 0) {
        matches.map(function (sitemap) {
          winston.info("sitemap: " + JSON.stringify(sitemap), logOpts);
          promise = promise.then(function() {
            return siteHandler(ws, sitemap);
          }).then(function(results) {
            siteResults.push({
              "sitemap": sitemap,
              "results": results
            });
          });
        });
      }
    }
    return promise.then(function() {
      var reportSrc = util.generateFromTemplate({"results": siteResults}, reportTmpl);
      winston.info("processed: " + siteResults.length + " sites", logOpts);
      fs.writeFileSync("app/site-reporter.html", reportSrc);
      winston.info("process COMPLETE", logOpts);
      process.exit(1);
    });
  });
