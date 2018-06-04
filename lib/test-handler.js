var lo = require("lodash");
var winston = require("winston");
var util = require('./util.js');
var request = require('superagent');
var colors = require('colors/safe');
var axeHandler = require('./axe-handler.js');
var logOpts = {
  module: colors.red("sitemap-handler.js")
};

module.exports = function(targets) {
  //winston.info("handling sitemap: " + JSON.stringify(sitemap, false, 2), logOpts);
  //winston.info("processing target: " + target, logOpts);
  var pageResults = {};
  return new Promise(function (resolve, reject) {
    var promise = Promise.resolve(null);
    if (Array.isArray(targets)) {
      targets.map(function (page) {
        winston.info("page given: ", page);
        var pageName = page['name'];
        var pageTitle = page['title'];
        var url = page['url'];
        promise = promise.then(function() {
          return axeHandler(url)
        }).then(function(results) {
          pageResults['siteName'] = url;
          pageResults[url] = results;
        });
      })
    }

    return promise.then(function() {
      var bodybuffer = "";
      var pageLinks = Object.keys(pageResults).sort();
      pageLinks.map(function(key) {
        bodybuffer = bodybuffer + pageResults[key];
      });
      winston.info("processed: " + pageLinks.length + " pages for target: " + targets, {module: colors.red("index.js")});
      resolve(bodybuffer);
    });
  }); //end new Promise
}; //end module.exports
