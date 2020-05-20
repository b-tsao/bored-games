'use strict';

const log4js = require('log4js');
const logger = log4js.getLogger('avalon');

function test(req, res) {
  logger.debug("Hello World request received");
  res.send("Hello, World!");
}

module.exports = {
  test
};