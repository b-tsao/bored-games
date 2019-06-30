'use strict';
const io = require('socket.io');
const log4js = require('log4js');
const IORoomManager = require('./IORoomManager');

const logger = log4js.getLogger('io');

class IOManager {
  constructor(server) {
    this.ioServer = io(server);
    logger.info('Socket IO is listening on the server');
  
    // Setting up a socket with the namespace "connection" for new sockets
    this.ioServer.on("connection", socket => {
      logger.info(`Client (${socket.id}) connected from address (${socket.handshake.address})`);

      this.onClientConnect(socket);

      // A special namespace "disconnect" for when a client disconnects
      socket.on("disconnect", (reason) => {
        logger.info(`Client (${socket.id}) disconnected: ${reason}`);
      });
    });
    
    this.initListeners();
  }
  
  initListeners() {
    new IORoomManager(this.ioServer);
  }
  
  onClientConnect(client) {
    client.emit('server', "Hello World!");

    //Here we listen on a new namespace called "incoming data"
    client.on("incoming data", (data) => {
        //Here we broadcast it out to all other sockets EXCLUDING the socket which sent us the data
       client.broadcast.emit("outgoing data", {num: data});
    });
  }
}

module.exports = IOManager