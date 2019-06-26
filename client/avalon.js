'use strict';

const log4js = require('log4js');
const logger = log4js.getLogger('avalon');

function spectate(req, res) {
  logger.debug(req.body);
  res.end();
}

module.exports = {
  spectate
};