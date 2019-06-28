'use strict';
const io = require('socket.io');
const log4js = require('log4js');

const ioLogger = log4js.getLogger('io');

class IOHandler {
  constructor(server) {
    this.ioServer= io(server);
    ioLogger.info('Socket IO is listening on the server');
  
    // Setting up a socket with the namespace "connection" for new sockets
    this.ioServer.on("connection", socket => {
      ioLogger.info(`Client (${socket.handshake.address}) connected`);

      this.onClientConnect(socket);

      // A special namespace "disconnect" for when a client disconnects
      socket.on("disconnect", (reason) => {
        ioLogger.info(`Client (${socket.handshake.address}) disconnected: ${reason}`);
      });
    });
  }
  
  onClientConnect(client) {
    client.emit('notification', "Hello World!");

    //Here we listen on a new namespace called "incoming data"
    client.on("incoming data", (data)=>{
        //Here we broadcast it out to all other sockets EXCLUDING the socket which sent us the data
       client.broadcast.emit("outgoing data", {num: data});
    });

    client.on("disconnect", (reason) => {
      console.log(`I can see it too!`);
    });
  }
}

module.exports = IOHandler