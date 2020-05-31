import http from 'http';
import io from 'socket.io';
import log4js from 'log4js';
import IORoomServer from './IORoomServer';

const logger = log4js.getLogger('IOServer');

export default class IOServer {
  ioServer: io.Server;

  constructor(server: http.Server) {
    this.ioServer = io(server);
    logger.info('Socket IO is listening on the server');

    // Setting up a socket with the namespace 'connection' for new sockets
    this.ioServer.on('connection', socket => {
      logger.info(`Client (${socket.id}) connected from address (${socket.handshake.address})`);

      this.onClientConnect(socket);

      // A special namespace 'disconnect' for when a client disconnects
      socket.on('disconnect', (reason) => {
        logger.info(`Client (${socket.id}) disconnected: ${reason}`);
      });
    });

    this.initListeners();
  }

  initListeners() {
    new IORoomServer(this.ioServer);
  }

  onClientConnect(client: io.Socket) {
    client.emit('server', 'Hello, World!');

    // Here we listen on a new namespace called 'incoming data'
    client.on('incoming data', (data) => {
      // Here we broadcast it out to all other sockets EXCLUDING the socket which sent us the data
      client.broadcast.emit('outgoing data', { num: data });
    });
  }
}