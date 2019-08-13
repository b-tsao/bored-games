'use strict';
const io = require('socket.io');
const log4js = require('log4js');
const IORoomServer = require('./IORoomServer');

const logger = log4js.getLogger('IOServer');

class IOServer {
  constructor(server) {
    this.ioServer = io(server, {
      upgradeTimeout: 60000 // default value is 10000ms, try changing it to 20k or more
    });
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
    new IORoomServer(this.ioServer);
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

module.exports = IOServer