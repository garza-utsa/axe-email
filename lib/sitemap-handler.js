var lo = require("lodash");
var winston = require("winston");
var util = require('./util.js');
var request = require('superagent');
var colors = require('colors/safe');
var axeHandler = require('./axe-handler.js');
var logOpts = {
  module: colors.red("sitemap-handler.js")
};

module.exports = function(target) {
  //winston.info("handling sitemap: " + JSON.stringify(sitemap, false, 2), logOpts);
  winston.info("processing target: " + target, logOpts);
  var pageResults = [];
  return new Promise(function (resolve, reject) {
    var promise = Promise.resolve(null);
    request.get(target).end(function(err, res) {
      if (err || !res.ok) {
        //winston.error(err, logOpts);
        reject(err);
      } else {
        var response = res.body;
        var site_name = 'site://' + response['site_name'];
        var site_url = 'http:' + response['site_url'];
        var cts = response['contentTypesRoot'];
        var scts = response['contentTypesSite'];

        if (Array.isArray(cts)) {
          cts.concat(scts);
        }
        winston.info("contenttypes size: " + cts.length, logOpts);
        winston.info(response['site_name'], logOpts);
        cts.map(function (type) {
          //winston.info(JSON.stringify(type, false, 2), logOpts);
          var contentTypeName = type['contentType'];
          var pages = type['pages'];

          pages.map(function (page) {
            var pageName = page['asset-name'];
            var pageTitle = page['asset-title'];
            var pageLink = page['asset-link'] + ".html";
            var url = pageLink.replace(site_name, site_url);
            winston.info("AXE: " + contentTypeName + " - " + url, logOpts);
            if (pageLink.indexOf('_cascade') == -1 ) {
              promise = promise.then(function() {
                return axeHandler(url)
              }).then(function(results) {
                pageResults.push(results);
              });
            }
          });
        });
      }
      return promise.then(function() {
        var bodybuffer = "";
        pageResults.map(function(p) {
          bodybuffer = bodybuffer + p;
        });
        winston.info("processed: " + pageResults.length + " pages for target: " + target, {module: colors.red("index.js")});
        resolve(bodybuffer);
      });
    }); //end request.get
  }); //end new Promise
}; //end module.exports
