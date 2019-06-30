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
        this.attachDisconnectListener(client);
      });
  }
  
  attachCreateListener(client) {
    client.on('create', (data, callback) => {
      logger.trace(`Client (${client.id}) requesting create room: ${JSON.stringify(data)}`);
      try {
        const key = this.gameRoomManager.createRoom(data.game);
        if (!this.gameRoomManager.joinRoom(key, client)) {
          this.gameRoomManager.deleteRoom(key);
          throw new Error('Client could not join room');
        }
        client.roomKey = key;
        return callback(null, key);
      } catch (err) {
        return callback(err);
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