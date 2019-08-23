'use strict';
const log4js = require('log4js');
const cookie = require('cookie');
const deepExtend = require('deep-extend');
const RoomManager = require('../games/RoomManager');

const logger = log4js.getLogger('IORoomServer');

class IORoomServer {
  constructor(ioServer) {
    this.ioServer = ioServer;

    this.roomManager = new RoomManager();
    
    this.ioRoomServer = this.ioServer.of('/room');
    this.ioRoomServer.on('connection', (client) => {
      this.initializeClient(client);
      
      this.attachCreateListener(client);
      this.attachGetListener(client);
      this.attachJoinListener(client);
      this.attachHostActionListener(client);
      this.attachSettingsListener(client);
      this.attachGameListener(client);
      this.attachDisconnectListener(client);
      this.attachReconnectListener(client);
    });
  }
  
  initializeClient(client) {
    if (client.handshake.headers.cookie) {
      const cookies = cookie.parse(client.handshake.headers.cookie);
      if (cookies.userId) {
        client.userId = cookies.userId;
      } else {
        client.userId = client.id;
      }
      if (cookies.roomKey) {
        client.roomKey = cookies.roomKey;
      }
    } else {
      client.userId = client.id;
    }
  }
  
  attachReconnectListener(client) {
    client.on('reconnect', () => {
      logger.trace(`Client (${client.userId}) requesting to reconnect to room (${key})`);
      
      const key = client.roomKey;
      
      const room = this.roomManager.getRoom(key);
      if (room == null) {
        logger.error(`Client (${client.userId}) failed to join room (${key}): Room does not exist`);
        client.emit('message', {status: 'error', message: "Room does not exist"});
        return client.disconnect();
      }
      
      room.add({client: client.id, id: client.userId}, (err, changes, options) => {
        if (err) {
          client.emit('message', {status: 'error', message: err});
          return client.disconnect();
        } else {
          client.join(key);
          if (!options) {
            // If there are options, the client was a player and was reconnected
            client.join(`${key}#spectators`);
          }
          this.broadcastChanges(room, changes, options);
        }
      });
    });
  }
  
  attachCreateListener(client) {
    client.on('create', (game) => {
      logger.trace(`Client (${client.userId}) requesting create game (${game}) room`);
      
      client.emit('create', {status: 'creating', message: 'Creating room'});
      try {
        const room = this.roomManager.createRoom(game);
        const key = room.key;
        client.emit('create', {status: 'creating', message: 'Joining room'});
        room.addSpectator({client: client.id, id: client.userId}, (err, changes) => {
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
        logger.error(`Client (${client.userId}) create game (${game}) room request denied: ${err}`);
        client.emit('create', {status: 'error', message: err.message});
        client.disconnect();
      }
    });
  }
  
  attachGetListener(client) {
    client.on('get', (callback = () => {}) => {
      const key = client.roomKey;
      logger.trace(`Client (${client.userId}) requesting room (${key}) information`);
      
      const room = this.roomManager.getRoom(key);
      if (room == null) {
        logger.error(`Client (${client.userId}) failed to retrieve room (${key}) information: Room does not exist`);
        callback('Room does not exist');
        return client.disconnect();
      }

      logger.info(`Client (${client.userId}) retrieved room (${key}) information`);
      callback(null, room.toJSON());
    });
  }
  
  attachJoinListener(client) {
    client.on('joinRoom', (key) => {
      logger.trace(`Client (${client.userId}) requesting join room (${key})`);
      
      if (key == null) {
        logger.error(`Client (${client.userId}) join room (${key}) request denied: Invalid key`);
        return client.emit('joinRoom', {status: 'error', message: 'Invalid key'});
      } else {
        key = key.toUpperCase();
      }
      
      client.emit('joinRoom', {status: 'joining', message: 'Joining room'});
      const room = this.roomManager.getRoom(key);
      if (room == null) {
        logger.error(`Client (${client.userId}) failed to join room (${key}): Room does not exist`);
        client.emit('joinRoom', {status: 'error', message: "Room does not exist"});
        return client.disconnect();
      }
      
      room.add({client: client.id, id: client.userId}, (err, changes, options) => {
        if (err) {
          client.emit('joinRoom', {status: 'error', message: err});
          return client.disconnect();
        } else {
          client.roomKey = key;
          client.join(key);
          if (!options) {
            // If there are options, the client was a player and was reconnected
            client.join(`${key}#spectators`);
          }
          client.emit('joinRoom', {status: 'complete'});
          this.broadcastChanges(room, changes, options);
        }
      });
    });
    
    client.on('joinSpectate', () => {
      const key = client.roomKey;
      logger.trace(`Client (${client.userId}) requesting to join spectate in room (${key})`);
      const room = this.roomManager.getRoom(key);
      if (room == null) {
        logger.error(`Client (${client.userId}) failed to join room (${key}): Room does not exist`);
        client.emit('message', {status: 'error', text: "Room does not exist"});
        return client.disconnect();
      }
      room.addSpectator({client: client.id, id: client.userId}, (err, changes) => {
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
      logger.trace(`Client (${client.userId}) requesting to join game in room (${key}) as name (${name})`);
      const room = this.roomManager.getRoom(key);
      if (room == null) {
        logger.error(`Client (${client.userId}) failed to join game (${key}): Room does not exist`);
        client.emit('message', {status: 'error', text: "Room does not exist"});
        return client.disconnect();
      }
      room.addPlayer({client: client.id, id: client.userId}, name, (err, changes) => {
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
      logger.trace(`Client (${client.userId}) requesting host action (${action}) against id (${id}) in room (${key})`);
      const room = this.roomManager.getRoom(key);
      if (room == null) {
        logger.error(`Client (${client.userId}) failed to do host action (${action}) against id (${id}) in room (${key}): Room does not exist`);
        client.emit('message', {status: 'error', text: "Room does not exist"});
        return client.disconnect();
      }
      room.hostAction(action, client.userId, id, (err, changes) => {
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
      logger.trace(`Client (${client.userId}) requesting settings change in room (${key}): ${JSON.stringify(settings)}`);
      const room = this.roomManager.getRoom(key);
      if (room == null) {
        logger.error(`Client (${client.userId}) change settings in room (${key}) failed: Room does not exist`);
        client.emit('message', {status: 'error', text: "Room does not exist"});
        return client.disconnect();
      }
      room.changeSettings(client.userId, settings, (err, changes) => {
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
      logger.trace(`Client (${client.userId}) requesting game action (${action}) in room (${key}): ${JSON.stringify(data)}`);
      const room = this.roomManager.getRoom(key);
      if (room == null) {
        logger.error(`Client (${client.userId}) game action (${action}) in room (${key}) failed: Room does not exist`);
        client.emit('message', {status: 'error', text: "Room does not exist"});
        return client.disconnect();
      }
      room.gameAction(client.userId, action, data, (err, changes, options) => {
        if (err) {
          client.emit('message', {status: 'error', text: err});
        }
        if (changes && changes.game) {
          this.broadcastChanges(room, changes, options);
        }
      });
    });
  }
  
  attachDisconnectListener(client) {
    client.on('disconnect', (reason) => {
      const key = client.roomKey;
      const room = this.roomManager.getRoom(key);
      if (room != null) {
        logger.trace(`Removing client (${client.userId}) from room (${client.roomKey}): ${reason}`);
        room.remove(client.userId, (err, changes, options) => {
          if (!err) {
            if (room.occupants === 0) {
              logger.trace(`Deleting room (${key}): Room empty`);
              this.roomManager.deleteRoom(key);
            } else {
              this.broadcastChanges(room, changes, options);
            }
          }
        });
      }
    });
  }
  
  broadcastChanges(room, changes, options) {
    const {sendSecrets, setCookie, deleteCookie} = options ? options : false;
    
    if (setCookie) {
      const players = room.game.state.players;
      for (const player of players.toArray()) {
        this.ioRoomServer.to(player.client).emit('setCookie', cookie.serialize('userId', player.id));
        this.ioRoomServer.to(player.client).emit('setCookie', cookie.serialize('roomKey', room.key));
      }
    } else if (deleteCookie) {
      const players = room.game.state.players;
      for (const player of players.toArray()) {
        this.ioRoomServer.to(player.client).emit('setCookie', 'userId=;expires=Thu, 01 Jan 1970 00:00:01 GMT;');
        this.ioRoomServer.to(player.client).emit('setCookie', 'roomKey=;expires=Thu, 01 Jan 1970 00:00:01 GMT;');
      }
    }
    
    if (sendSecrets) {
      const players = room.game.state.players;
      const secrets = room.game.secrets;
      for (const player of players.toArray()) {
        if (player.client) {
          let playerView = changes;
          if (secrets.hasOwnProperty(player.id)) {
            // player has secrets (player view)
            playerView = this.addPlayerView(changes, players, secrets[player.id]);
          }
          this.ioRoomServer.to(player.client).emit('changes', playerView);
        }
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
          players: playerView.toArray()
        }
      }
    };
  }
}

module.exports = IORoomServer;