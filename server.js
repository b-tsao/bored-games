'use strict';

// init project
const express = require('express');
const redirectToHTTPS = require('express-http-to-https').redirectToHTTPS;
const bodyParser = require("body-parser");
const router = require('./io/routes/index');

const http = require('http');
const IOServer = require('./io/IOServer');

// resources
const log4js = require('log4js');
log4js.configure('log4js.config.json');

// boardgame.io server
const Server = require('boardgame.io/server').Server;
const Mahjong = require('./src/games/mahjong/game').MahjongGame;

/**
 * Starts the Express server.
 *
 * @return {ExpressServer} instance of the Express server.
 */
function startServer() {
  const app = express();
  const logger = log4js.getLogger("server");

  // Redirect HTTP to HTTPS,
  // app.use(redirectToHTTPS([/localhost:(\d{4})/], [/\/insecure/], 301));

  // Enable router to parse json and url-encoded payloads
  app.use(bodyParser.json({ limit: "2mb" }));
  app.use(bodyParser.urlencoded({ limit: "2mb", extended: false }));

  // Logging for each received request
  app.use((req, res, next) => {
    const path = `"${req.method} ${req.path}"`;
    const body = req.body.constructor === Object && Object.entries(req.body).length === 0 ? false : JSON.stringify(req.body);
    const payload = body ? ` ${body.length} ${body}` : '';
    const log = `${req.ip} - ${path}${payload}`;
    log4js.getLogger("receive").info(log);
    next();
  });

  // Logging for each returned request
  app.use(log4js.connectLogger(log4js.getLogger("return"), { level: 'info' }));

  // Handle requests for static files
  app.use(express.static('public'));

  // Router setup
  app.use(router);

  // Redirect if nothing else sent a response
  app.get('*', (req, res) => {
    res.redirect('/');
  });

  const server = http.createServer(app);

  const sio = new IOServer(server);

  // Start the server
  server.listen(3000, () => {
    logger.info('Your app is listening on port ' + server.address().port);
  });

  return server;
}

function startBGServer() {
  const server = Server({ games: [Mahjong] });
  server.run(8000);
}

startServer();
startBGServer();