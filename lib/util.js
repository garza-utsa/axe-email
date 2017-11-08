'use strict';

var lo = require("lodash");
var fs = require("fs");
var winston = require("winston");
var moment = require('moment');

var colors = require('colors/safe');
var logOpts = {
  module: colors.green("lib/util")
};

var exports = module.exports = {};

exports.generateFromTemplate = function(model, template) {
  var fileData = fs.readFileSync(template, 'UTF-8');
  var jobTemplate = lo.template(fileData);
  return jobTemplate(model);
};

exports.resolve = function(path, obj) {
  return path.split('.').reduce(function(prev, curr) {
    return prev ? prev[curr] : undefined
  }, obj || self);
}
