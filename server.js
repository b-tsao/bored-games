// server.js
// where your node app starts

'use strict';

// init project
const express = require('express');
const redirectToHTTPS = require('express-http-to-https').redirectToHTTPS;
const router = require('./router');

// resources
const log4js = require('log4js');
log4js.configure('log4js.config.json');

/**
 * Starts the Express server.
 *
 * @return {ExpressServer} instance of the Express server.
 */
function startServer() {
  const app = express();
  const logger = log4js.getLogger("server");

  // Redirect HTTP to HTTPS,
  app.use(redirectToHTTPS([/localhost:(\d{4})/], [], 301));
  
  // Logging for each request
  app.use(log4js.connectLogger(log4js.getLogger("http"), {level: 'info'}));
  
  // Router setup
  app.use(router);

  // Handle requests for static files
  app.use(express.static('public'));

  // Start the server
  const listener = app.listen(process.env.PORT, function() {
    logger.info('Your app is listening on port ' + listener.address().port);
  });
  
  return listener;
}

startServer();