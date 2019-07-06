'use strict';

const log4js = require('log4js');
const GameRoomManager = require('../games/GameRoomManager');

const logger = log4js.getLogger('io');

class IORoomManager {
  constructor(ioServer) {
    this.ioServer = ioServer;

    this.gameRoomManager = new GameRoomManager();
    
    this.ioRoomServer = this.ioServer.of('/room');
    this.ioRoomServer.on('connection', (client) => {
      try {
        this.attachCreateListener(client);
        this.attachGetListener(client);
        this.attachJoinListener(client);
        this.attachHostActionListener(client);
        this.attachDisconnectListener(client);
      } catch (err) {
        logger.fatal(`Client (${client.id}) requested action failed: ${err}`);
      }
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
        const err = this.gameRoomManager.joinRoom(key, client);
        if (err) {
          this.gameRoomManager.deleteRoom(key);
          throw new Error('Client could not join room');
        }
        client.roomKey = key;
        client.join(key);
        client.emit('create', {status: 'complete', key});
        // Clean changes because we already know we just joined
        return this.gameRoomManager.cleanChanges(key);
      } catch (err) {
        logger.error(`Client (${client.id}) create room request denied: ${err}`);
        client.emit('create', {status: 'error', message: err.message});
        return client.disconnect();
      }
    });
  }
  
  attachGetListener(client) {
    client.on('get', (callback) => {
      const key = client.roomKey;
      logger.trace(`Client (${client.id}) requesting room (${key}) information`);
      
      const room = this.gameRoomManager.getRoom(key);
      if (room == null) {
        logger.error(`Client (${client.id}) failed to retrieve room (${key}) information: Room does not exist`)
        return callback('Room does not exist');
      }

      logger.info(`Client (${client.id} retrieved room (${key}) information`);
      return callback(null, room);
    });
  }
  
  attachJoinListener(client) {
    client.on('joinRoom', (key) => {
      logger.trace(`Client (${client.id}) requesting join room (${key})`);
      
      if (key == null) {
        if (client.roomKey) {
          key = client.roomKey;  
        } else {
          logger.error(`Client (${client.id}) join room (${key}) request denied: Invalid key`);
          return client.emit('joinRoom', {status: 'error', message: 'Invalid key'});
        }
      } else {
        key = key.toUpperCase();
      }
      
      if (client.roomKey && client.roomKey !== key) {
        logger.error(`Client (${client.id}) join room (${key}) request denied: Already in a room (${client.roomKey})`);
        return client.emit('joinRoom', {status: 'error', message: 'Already in a room'});
      }
      
      client.emit('joinRoom', {status: 'joining', message: 'Joining room'});
      const err = this.gameRoomManager.joinRoom(key, client);
      if (err) {
        client.emit('joinRoom', {status: 'error', message: err});
        return client.disconnect();
      }
      if (!client.roomKey) {
        client.join(key);
        client.roomKey = key;
      }
      client.emit('joinRoom', {status: 'complete'});
      return this.broadcastChanges(key);
    });
    
    client.on('joinGame', (name) => {
      const key = client.roomKey;
      logger.trace(`Client (${client.id}) requesting to join game in room (${key}) as name (${name})`);
      client.emit('joinGame', {status: 'joining', message: 'Joining game'});
      const err = this.gameRoomManager.joinGame(key, client, name);
      if (err) {
        return client.emit('joinGame', {status: 'error', message: err});
      }
      client.emit('joinGame', {status: 'complete'});
      return this.broadcastChanges(key);
    });
  }
  
  attachHostActionListener(client) {
    client.on('hostAction', ({action, id}, callback) => {
      const key = client.roomKey;
      logger.trace(`Client (${client.id}) requesting host action (${action}) against id (${id}) in room (${key})`);
      return callback(this.gameRoomManager.doHostAction(key, client, action, id));
    });
  }
  
  attachDisconnectListener(client) {
    client.on('disconnect', (reason) => {
      const key = client.roomKey;
      if (key) {
        logger.trace(`Removing client (${client.id}) from room (${client.roomKey}): ${reason}`);
        this.gameRoomManager.removeClient(client.roomKey, client);
        return this.broadcastChanges(key);
      }
    });
  }
  
  broadcastChanges(room) {
    const changes = this.gameRoomManager.cleanChanges(room);
    if (changes == null) {
      return logger.error(`Broadcasting changes to room (${room}) failed: Room does not exist`);
    }
    logger.info(`Broadcasting changes to room (${room}): ${JSON.stringify(changes)}`);
    this.ioRoomServer.to(room).emit('change', changes);
  }
}

module.exports = IORoomManager;