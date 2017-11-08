var AxeBuilder = require('axe-webdriverjs');
var WebDriver = require('selenium-webdriver');

var driver = new WebDriver.Builder()
  .forBrowser('chrome')
  .build();

driver
  .get('http://localhost:3000')
  .then(function () {
    AxeBuilder(driver)
      .analyze(function (results) {
        console.log(results.violations);
      });
  });
