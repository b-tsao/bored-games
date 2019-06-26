// server.js
// where your node app starts

'use strict';

// init project
const express = require('express');
const redirectToHTTPS = require('express-http-to-https').redirectToHTTPS;
const bodyParser = require("body-parser");
const router = require('./routes/index');

const http = require('http');
const io = require('socket.io');

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
  const ioLogger = log4js.getLogger('io');

  // Redirect HTTP to HTTPS,
  app.use(redirectToHTTPS([/localhost:(\d{4})/], [], 301));
  
  // Enable router to parse json and url-encoded payloads
  app.use(bodyParser.json({limit: "2mb"}));
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
  app.use(log4js.connectLogger(log4js.getLogger("return"), {level: 'info'}));
  
  // Router setup
  app.use(router);

  // Handle requests for static files
  app.use(express.static('public'));
  
  const server = http.createServer(app);
  const sio = io(server);
  
  // Create a socket.io instance using our express server
  // var sio = io.listen(server);
  ioLogger.info('Socket IO is listening on the server');
  
  // Setting up a socket with the namespace "connection" for new sockets
  sio.on("connection", socket => {
    ioLogger.info("New client connected");

    // Here we listen on a new namespace called "incoming data"
    socket.on("incoming data", (data) => {
        // Here we broadcast it out to all other sockets EXCLUDING the socket which sent us the data
       socket.broadcast.emit("outgoing data", {num: data});
    });

    // A special namespace "disconnect" for when a client disconnects
    socket.on("disconnect", () => {
      ioLogger.warn("Client disconnected");
    });
  });
  
  // Start the server
  server.listen(process.env.PORT, function () {
    logger.info('Your app is listening on port ' + server.address().port);
  });
  
  return server;
}

startServer();