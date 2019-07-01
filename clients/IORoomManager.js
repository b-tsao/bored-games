'use strict';

const log4js = require('log4js');
const GameRoomManager = require('../games/GameRoomManager');

const logger = log4js.getLogger('io');

class IORoomManager {
  constructor(ioServer) {
    this.ioServer = ioServer;

    this.gameRoomManager = new GameRoomManager();
    
    this.ioServer
      .of('/room')
      .on('connection', (client) => {
        this.attachCreateListener(client);
        this.attachGetListener(client);
        this.attachDisconnectListener(client);
      });
  }
  
  attachCreateListener(client) {
    client.on('create', (data) => {
      logger.trace(`Client (${client.id}) requesting create room: ${JSON.stringify(data)}`);
      
      if (client.roomKey) {
        logger.error(`Client (${client.id}) create room request denied: Already in a room (${client.roomKey})`);
        return client.emit('create', {status: 'error', message: 'Already in a room'});
      }
      
      client.emit('create', {status: 'creating', message: 'Creating room'});
      try {
        const key = this.gameRoomManager.createRoom(data.game);
        client.emit('create', {status: 'creating', message: 'Joining room'});
        if (!this.gameRoomManager.joinRoom(key, client)) {
          this.gameRoomManager.deleteRoom(key);
          throw new Error('Client could not join room');
        }
        client.roomKey = key;
        return client.emit('create', {status: 'complete', key});
      } catch (err) {
        client.emit('create', {status: 'error', message: err.message});
        return client.disconnect();
      }
    });
  }
  
  attachGetListener(client) {
    client.on('get', () => {
      const key = client.roomKey;
      logger.trace(`Client (${client.id}) requesting room (${key}) information`);
      
      try {
        const room = this.gameRoomManager.getRoom(key);
        logger.info(`Client (${client.id} retrieved room (${key}) information`);
        client.emit('get', {status: 'complete', room});
      } catch (err) {
        logger.error(`Client (${client.id}) failed to retrieve room (${key}) information: ${err}`)
        client.emit('get', {status: 'error', message: err.message});
      }
    });
  }
  
  attachDisconnectListener(client) {
    client.on('disconnect', (reason) => {
      if (client.roomKey) {
        logger.trace(`Removing client (${client.id}) from room (${client.roomKey}): ${reason}`);
        this.gameRoomManager.removeClient(client.roomKey, client);
      }
    });
  }
}

module.exports = IORoomManager;