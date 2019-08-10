'use strict';
const log4js = require('log4js');
const RoomManager = require('../games/RoomManager');

const logger = log4js.getLogger('IORoomManager');

class IORoomManager {
  constructor(ioServer) {
    this.ioServer = ioServer;

    this.roomManager = new RoomManager();
    
    this.ioRoomServer = this.ioServer.of('/room');
    this.ioRoomServer.on('connection', (client) => {
      this.attachCreateListener(client);
      this.attachGetListener(client);
      this.attachJoinListener(client);
      this.attachHostActionListener(client);
      this.attachSettingsListener(client);
      this.attachGameListener(client);
      this.attachDisconnectListener(client);
    });
  }
  
  attachCreateListener(client) {
    client.on('create', (game) => {
      logger.trace(`Client (${client.id}) requesting create game (${game}) room`);
      
      if (client.roomKey) {
        logger.error(`Client (${client.id}) create game (${game}) room request denied: Already in a room (${client.roomKey})`);
        return client.emit('create', {status: 'error', message: 'Already in a room'});
      }
      
      client.emit('create', {status: 'creating', message: 'Creating room'});
      try {
        const key = this.roomManager.createRoom(game);
        client.emit('create', {status: 'creating', message: 'Joining room'});
        const err = this.roomManager.joinRoom(key, client.id);
        if (err) {
          this.roomManager.deleteRoom(key);
          throw new Error('Client could not join room');
        }
        client.roomKey = key;
        client.join(key);
        client.emit('create', {status: 'complete', key});
        // Clean changes because we already know we just joined
        return this.roomManager.cleanChanges(key);
      } catch (err) {
        logger.error(err);
        logger.error(`Client (${client.id}) create game (${game}) room request denied: ${err}`);
        client.emit('create', {status: 'error', message: err.message});
        return client.disconnect();
      }
    });
  }
  
  attachGetListener(client) {
    client.on('get', (callback = () => {}) => {
      const key = client.roomKey;
      logger.trace(`Client (${client.id}) requesting room (${key}) information`);
      
      const room = this.roomManager.getRoom(key);
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
        logger.error(`Client (${client.id}) join room (${key}) request denied: Invalid key`);
        return client.emit('joinRoom', {status: 'error', message: 'Invalid key'});
      } else {
        key = key.toUpperCase();
      }
      
      if (client.roomKey && client.roomKey !== key) {
        logger.error(`Client (${client.id}) join room (${key}) request denied: Already in a room (${client.roomKey})`);
        return client.emit('joinRoom', {status: 'error', message: 'Already in a room'});
      }
      
      client.emit('joinRoom', {status: 'joining', message: 'Joining room'});
      const err = this.roomManager.joinRoom(key, client.id);
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
    
    client.on('joinSpectate', () => {
      const key = client.roomKey;
      logger.trace(`Client (${client.id}) requesting to join spectate in room (${key})`);
      const err = this.roomManager.joinRoom(key, client.id);
      if (err) {
        client.emit('message', {status: 'error', text: err});
        client.disconnect();
      }
      this.broadcastChanges(key);
    });
    
    client.on('joinGame', (name) => {
      const key = client.roomKey;
      logger.trace(`Client (${client.id}) requesting to join game in room (${key}) as name (${name})`);
      const err = this.roomManager.joinGame(key, client.id, name);
      if (err) {
        client.emit('message', {status: 'error', text: err});
      } else {
        this.broadcastChanges(key);
      }
    });
  }
  
  attachHostActionListener(client) {
    client.on('hostAction', (action, id) => {
      const key = client.roomKey;
      logger.trace(`Client (${client.id}) requesting host action (${action}) against id (${id}) in room (${key})`);
      const err = this.roomManager.hostAction(key, action, client.id, id);
      if (err) {
        client.emit('message', {status: 'error', text: err});
      } else {
        this.broadcastChanges(key);
      }
    });
  }
  
  attachSettingsListener(client) {
    client.on('settings', (settings) => {
      const key = client.roomKey;
      logger.trace(`Client (${client.id}) requesting settings change in room (${key}): ${JSON.stringify(settings)}`);
      const err = this.roomManager.changeSettings(key, client.id, settings);
      if (err) {
        client.emit('message', {status: 'error', text: err});
      } else {
        this.broadcastChanges(key);
      }
    });
  }
  
  attachGameListener(client) {
    client.on('game', (action, data) => {
      const key = client.roomKey;
      logger.trace(`Client (${client.id}) requesting to start game in room (${key})`);
      const err = this.roomManager.gameAction(key, client.id, action, data);
      if (err) {
        client.emit('message', {status: 'error', text: err});
      } else {
        this.broadcastChanges(key);
        const secrets = this.roomManager.getPlayerSecrets(key);
        logger.debug(secrets);
      }
    });
  }
  
  attachDisconnectListener(client) {
    client.on('disconnect', (reason) => {
      const key = client.roomKey;
      if (key) {
        logger.trace(`Removing client (${client.id}) from room (${client.roomKey}): ${reason}`);
        this.roomManager.removeClient(client.roomKey, client.id);
        return this.broadcastChanges(key);
      }
    });
  }
  
  broadcastChanges(room) {
    const changes = this.roomManager.cleanChanges(room);
    if (changes == null) {
      return logger.error(`Broadcasting changes to room (${room}) failed: No changes to broadcast`);
    }
    logger.info(`Broadcasting changes to room (${room}): ${JSON.stringify(changes)}`);
    this.ioRoomServer.to(room).emit('change', changes);
  }
}

module.exports = IORoomManager;