'use strict';
const log4js = require('log4js');
const deepExtend = require('deep-extend');
const RoomManager = require('../games/RoomManager');

const logger = log4js.getLogger('IORoomManager');

class IORoomServer {
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
        const room = this.roomManager.createRoom(game);
        const key = room.key;
        client.emit('create', {status: 'creating', message: 'Joining room'});
        room.addSpectator(client.id, (err, changes) => {
          if (err) {
            this.roomManager.deleteRoom(key);
            throw new Error('Client could not join room');
          } else {
            client.roomKey = key;
            client.join(key);
            client.emit('create', {status: 'complete', key});
          }
        });
      } catch (err) {
        logger.error(`Client (${client.id}) create game (${game}) room request denied: ${err}`);
        client.emit('create', {status: 'error', message: err.message});
        client.disconnect();
      }
    });
  }
  
  attachGetListener(client) {
    client.on('get', (callback = () => {}) => {
      const key = client.roomKey;
      logger.trace(`Client (${client.id}) requesting room (${key}) information`);
      
      const room = this.roomManager.getRoom(key);
      if (room == null) {
        logger.error(`Client (${client.id}) failed to retrieve room (${key}) information: Room does not exist`);
        callback('Room does not exist');
        return client.disconnect();
      }

      logger.info(`Client (${client.id}) retrieved room (${key}) information`);
      callback(null, room.toJSON());
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
      const room = this.roomManager.getRoom(key);
      if (room == null) {
        logger.error(`Client (${client.id}) failed to join room (${key}): Room does not exist`);
        client.emit('joinRoom', {status: 'error', message: "Room does not exist"});
        return client.disconnect();
      }
      room.addSpectator(client.id, (err, changes) => {
        if (err) {
          client.emit('joinRoom', {status: 'error', message: err});
          return client.disconnect();
        } else {
          if (!client.roomKey) {
            client.join(key);
            client.roomKey = key;
          }
          client.join(`${key}#spectators`);
          client.emit('joinRoom', {status: 'complete'});
          this.broadcastChanges(room, changes);
        }
      });
    });
    
    client.on('joinSpectate', () => {
      const key = client.roomKey;
      logger.trace(`Client (${client.id}) requesting to join spectate in room (${key})`);
      const room = this.roomManager.getRoom(key);
      if (room == null) {
        logger.error(`Client (${client.id}) failed to join room (${key}): Room does not exist`);
        client.emit('message', {status: 'error', text: "Room does not exist"});
        return client.disconnect();
      }
      room.addSpectator(client.id, (err, changes) => {
        if (err) {
          client.emit('message', {status: 'error', text: err});
          client.disconnect();
        } else {
          client.join(`${key}#spectators`);
        }
        this.broadcastChanges(room, changes);
      });
    });
    
    client.on('joinGame', (name) => {
      const key = client.roomKey;
      logger.trace(`Client (${client.id}) requesting to join game in room (${key}) as name (${name})`);
      const room = this.roomManager.getRoom(key);
      if (room == null) {
        logger.error(`Client (${client.id}) failed to join game (${key}): Room does not exist`);
        client.emit('message', {status: 'error', text: "Room does not exist"});
        return client.disconnect();
      }
      room.addPlayer(client.id, name, (err, changes) => {
        if (err) {
          client.emit('message', {status: 'error', text: err});
        } else {
          client.leave(`${key}#spectators`);
          this.broadcastChanges(room, changes);
        }
      });
    });
  }
  
  attachHostActionListener(client) {
    client.on('hostAction', (action, id) => {
      const key = client.roomKey;
      logger.trace(`Client (${client.id}) requesting host action (${action}) against id (${id}) in room (${key})`);
      const room = this.roomManager.getRoom(key);
      if (room == null) {
        logger.error(`Client (${client.id}) failed to do host action (${action}) against id (${id}) in room (${key}): Room does not exist`);
        client.emit('message', {status: 'error', text: "Room does not exist"});
        return client.disconnect();
      }
      room.hostAction(action, client.id, id, (err, changes) => {
        if (err) {
          client.emit('message', {status: 'error', text: err});
        } else {
          this.broadcastChanges(room, changes);
        }
      });
    });
  }
  
  attachSettingsListener(client) {
    client.on('settings', (settings) => {
      const key = client.roomKey;
      logger.trace(`Client (${client.id}) requesting settings change in room (${key}): ${JSON.stringify(settings)}`);
      const room = this.roomManager.getRoom(key);
      if (room == null) {
        logger.error(`Client (${client.id}) change settings in room (${key}) failed: Room does not exist`);
        client.emit('message', {status: 'error', text: "Room does not exist"});
        return client.disconnect();
      }
      room.changeSettings(client.id, settings, (err, changes) => {
        if (err) {
          client.emit('message', {status: 'error', text: err});
        } else {
          this.broadcastChanges(room, changes);
        }
      });
    });
  }
  
  attachGameListener(client) {
    client.on('game', (action, data) => {
      const key = client.roomKey;
      logger.trace(`Client (${client.id}) requesting game action (${action}) in room (${key}): ${JSON.stringify(data)}`);
      const room = this.roomManager.getRoom(key);
      if (room == null) {
        logger.error(`Client (${client.id}) game action (${action}) in room (${key}) failed: Room does not exist`);
        client.emit('message', {status: 'error', text: "Room does not exist"});
        return client.disconnect();
      }
      room.gameAction(client.id, action, data, (err, changes, secrets) => {
        if (err) {
          client.emit('message', {status: 'error', text: err});
        }
        if (changes && changes.game) {
          this.broadcastChanges(room, changes, secrets);
        }
      });
    });
  }
  
  attachDisconnectListener(client) {
    client.on('disconnect', (reason) => {
      const key = client.roomKey;
      const room = this.roomManager.getRoom(key);
      if (room != null) {
        logger.trace(`Removing client (${client.id}) from room (${client.roomKey}): ${reason}`);
        room.remove(client.id, (err, changes, secrets) => {
          if (!err) {
            if (room.occupants === 0) {
              logger.trace(`Deleting room (${key}): Room empty`);
              this.roomManager.deleteRoom(key);
            } else {
              this.broadcastChanges(room, changes, secrets);
            }
          }
        });
      }
    });
  }
  
  broadcastChanges(room, changes, secrets) {
    if (secrets) {
      const players = room.game.state.players;
      for (const player of players.people) {
        let playerView = changes;
        if (secrets.hasOwnProperty(player.id)) {
          // player has secrets (player view)
          playerView = this.addPlayerView(changes, players, secrets[player.id]);
        }
        this.ioRoomServer.to(player.id).emit('changes', playerView);
      }
      this.ioRoomServer.to(`${room.key}#spectators`).emit('changes', changes);
    } else {
      this.ioRoomServer.to(room.key).emit('changes', changes);
    }
  }
  
  addPlayerView(changes, players, secret) {
    const playerView = players.map(player => {
      if (secret.hasOwnProperty(player.id)) {
        player = JSON.parse(JSON.stringify(player)); // deep clone copy
        deepExtend(player, secret[player.id]);
      }
      return player;
    });
    return {
      ...changes,
      game: {
        ...changes.game,
        state: {
          ...changes.game.state,
          players: playerView.toJSON()
        }
      }
    };
  }
}

module.exports = IORoomServer;