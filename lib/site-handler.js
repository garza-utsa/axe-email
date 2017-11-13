var nconf = require("nconf");
//var templator = require("./templator");
var lo = require("lodash");
var winston = require("winston");
var util = require('./util.js');
var request = require('superagent');
var colors = require('colors/safe');
var sitemapHandler = require('./sitemap-handler.js');
var logOpts = {
  module: colors.red("site-handler.js")
};

module.exports = function(ws, sitemap) {
  //winston.info("handling sitemap: " + JSON.stringify(sitemap, false, 2), logOpts);
  winston.info("process site: " + JSON.stringify(sitemap, false, 2), logOpts);
  return new Promise(function (resolve, reject) {
    var promise = Promise.resolve(null);
    var siteId = sitemap['path']['siteId'];
    var path = sitemap['path']['path'];
    var siteName = sitemap['path']['siteName'];
    var sitemapId = sitemap['id'];

    var siteReadUrl = ws['ws_base_url'] + 'read?u=' + ws['username'] + '&p=' + ws['password'];
    var readInfo = {
      "identifier" : {
        "type": "site",
        "id": siteId
      }
    }

    request.post(siteReadUrl).send(readInfo).set('accept', 'json').end(function(err, res) {
      if (err || !res.ok) {
        winston.error(err, logOpts);
        reject(err);
      } else {
        var siteReadResponse = res.body;
        var siteData = siteReadResponse['asset']['site'];
        if (siteData) {
          var siteURL = siteData['url'];
          var sitemapURL = 'http:' + siteURL + '/' + path + '.json';
          winston.info("attempting to request: " + sitemapURL, logOpts);
          return sitemapHandler(sitemapURL).then(function(results) {
            winston.info("sitemap handler returned content of lenght: " + results.length, logOpts);
            resolve(results);
          }).catch(function(err) {
            winston.error("failed to handle axe url", sitemapURL, logOpts);
            reject(err);
          })
        }
      }
    });
  });
};
