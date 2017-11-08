#!/usr/bin/env node
var nconf = require("nconf");
var lo = require("lodash");
var winston = require("winston");
var commander = require("commander");
var colors = require('colors/safe');

//var updateAsset = require("./lib/update-asset");
//var util = require("./lib/util");
var logOpts = {
  module: colors.green("index.js")
};

nconf.file('config.json');
winston.cli();
winston.level = 'info';

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
