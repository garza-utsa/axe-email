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

var bodybuffer = "<html><head><title>violation report</title></head><body>";
winston.info("processing START");

request.post(searchURL).send(searchInfo).set('accept', 'json')
  .end(function(err, res) {
    if (err || !res.ok) {
      winston.error(err, logOpts);
    } else {
      var searchResponse = res.body;
      var matches = searchResponse['matches'];
      if (matches.length > 0) {
        matches.map(function (sitemap) {
          promise = siteHandler(ws, sitemap).then(function(siteResults) {
              bodybuffer = bodybuffer + siteResults;
          });
        });
      }
    }
    return promise.then(function() {
      fs.writeFileSync("app/site-reporter.html", bodybuffer);
      winston.info("process COMPLETE", logOpts);
      process.exit(1);
    });
  });
