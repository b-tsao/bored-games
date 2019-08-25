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
      this.attachJoinListener(client);
      this.attachLeaveListener(client);
      this.attachConnectListener(client);
      this.attachDisconnectListener(client);
      this.attachGetListener(client);
      this.attachHostActionListener(client);
      this.attachSettingsListener(client);
      this.attachGameListener(client);
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
  
  attachCreateListener(client) {
    client.on('create', (game) => {
      logger.trace(`User (${client.userId}) requesting create game (${game}) room`);
      
      client.emit('create', {status: 'creating', message: 'Creating room'});
      this.roomManager.createRoom(game, (err, room) => {
        if (err) {
          logger.error(`User (${client.userId}) create game (${game}) room request denied: ${err}`);
          client.emit('create', {status: 'error', message: err});
          client.disconnect();
          return;
        }
        const key = room.key;
        client.roomKey = key;
        client.emit('create', {status: 'complete', key});
      });
    });
  }
  
  attachJoinListener(client) {
    client.on('join', (key) => {
      logger.trace(`User (${client.userId}) requesting join room (${key})`);
      
      if (key == null) {
        logger.error(`User (${client.userId}) join room (${key}) request denied: Invalid key`);
        client.emit('join', {status: 'error', message: 'Invalid key'});
        client.disconnect();
        return;
      } else {
        key = key.toUpperCase();
      }
      
      client.emit('join', {status: 'joining', message: 'Joining room'});
      const room = this.roomManager.getRoom(key);
      if (room == null) {
        logger.error(`User (${client.userId}) failed to join room (${key}): Room does not exist`);
        client.emit('join', {status: 'error', message: "Room does not exist"});
        client.disconnect();
        return;
      }
      
      if (room.contains(client.userId)) {
        const err = "Already in the room";
        logger.error(`User (${client.userId}) failed to join room (${key}): ${err}`);
        client.emit('join', {status: 'error', message: err});
        client.disconnect();
        return;
      }
      client.roomKey = key;
      client.emit('join', {status: 'complete'});
    });
    
    client.on('joinSpectate', () => {
      const key = client.roomKey;
      logger.trace(`User (${client.userId}) requesting to join spectate in room (${key})`);
      const room = this.roomManager.getRoom(key);
      if (room == null) {
        logger.error(`User (${client.userId}) failed to join room (${key}): Room does not exist`);
        client.emit('message', {status: 'error', text: "Room does not exist"});
        return client.disconnect();
      }
      room.addSpectator({id: client.userId, client: client.id}, (err, changes) => {
        if (err) {
          client.emit('message', {status: 'error', text: err});
          client.disconnect();
        } else {
          client.join(`${key}#spectators`);
          this.broadcastChanges(room, changes);
        }
      });
    });
    
    client.on('joinGame', (name) => {
      const key = client.roomKey;
      logger.trace(`User (${client.userId}) requesting to join game in room (${key}) as name (${name})`);
      const room = this.roomManager.getRoom(key);
      if (room == null) {
        logger.error(`User (${client.userId}) failed to join game (${key}): Room does not exist`);
        client.emit('message', {status: 'error', text: "Room does not exist"});
        return client.disconnect();
      }
      room.addPlayer({id: client.userId, client: client.id}, name, (err, changes) => {
        if (err) {
          client.emit('message', {status: 'error', text: err});
        } else {
          client.leave(`${key}#spectators`);
          this.broadcastChanges(room, changes);
        }
      });
    });
  }
  
  attachLeaveListener(client) {
    client.on('leave', (callback = () => {}) => {
      const key = client.roomKey;
      logger.trace(`User (${client.userId}) leaving room (${key})`);
      
      client.emit('setCookie', 'userId=;expires=Thu, 01 Jan 1970 00:00:01 GMT;');
      client.emit('setCookie', 'roomKey=;expires=Thu, 01 Jan 1970 00:00:01 GMT;');
      const room = this.roomManager.getRoom(key);
      if (room == null) {
        callback();
        client.disconnect();
      } else {
        room.remove(client.userId, (err, changes) => {
          callback();
          client.disconnect();
          if (!err) {
            if (room.occupants === 0) {
              logger.trace(`Deleting room (${key}): Room empty`);
              this.roomManager.deleteRoom(key);
            } else {
              this.broadcastChanges(room, changes);
            }
          }
        });
      }
    });
  }
  
  attachConnectListener(client) {
    client.on('connected', (reason) => {
      logger.trace(`User (${client.userId}) requesting connect with client (${client.id}) to room (${client.roomKey})`);
      const key = client.roomKey;
      const room = this.roomManager.getRoom(key);
      if (room == null) {
        logger.error(`User (${client.userId}) connect with client (${client.id}) to room (${client.roomKey}) failed: Room does not exist`);
        client.emit('message', {status: 'error', text: "Room does not exist"});
        client.disconnect();
        return;
      }
      room.connect(client.userId, client.id, (err, changes, options) => {
        if (err) {
          client.emit('message', {status: 'error', text: err});
          client.disconnect();
          return;
        }
        this.roomManager.clearRoomTimer(key);
        client.emit('setCookie', cookie.serialize('userId', client.userId));
        client.emit('setCookie', cookie.serialize('roomKey', room.key));
        client.join(key);
        // TODO MOVE: THIS IS A TERRIBLE PLACE TO DO THIS, BUT IT'S HERE FOR NOW
        if (room.spectators.contains(client.userId)) {
          client.join(`${key}#spectators`);
        }
        // END HACK
        this.broadcastChanges(room, changes, options);
      });
    });
  }
  
  attachDisconnectListener(client) {
    client.on('disconnect', (reason) => {
      const key = client.roomKey;
      const room = this.roomManager.getRoom(key);
      if (room != null) {
        logger.trace(`Disconnecting user (${client.userId}) with client (${client.id}) from room (${client.roomKey}): ${reason}`);
        room.disconnect(client.userId, client.id, (err, changes, options) => {
          if (!err) {
            if (room.occupants === 0) {
              this.roomManager.roomTimer(key);
            } else {
              this.broadcastChanges(room, changes, options);
            }
          }
        });
      }
    });
  }
  
  attachGetListener(client) {
    client.on('get', (callback = () => {}) => {
      const key = client.roomKey;
      logger.trace(`User (${client.userId}) requesting room (${key}) information`);
      
      const room = this.roomManager.getRoom(key);
      if (room == null) {
        logger.error(`User (${client.userId}) failed to retrieve room (${key}) information: Room does not exist`);
        callback('Room does not exist');
        return client.disconnect();
      }

      logger.info(`User (${client.userId}) retrieved room (${key}) information`);
      callback(null, room.toJSON());
    });
  }
  
  attachHostActionListener(client) {
    client.on('hostAction', (action, id) => {
      const key = client.roomKey;
      logger.trace(`User (${client.userId}) requesting host action (${action}) against user (${id}) in room (${key})`);
      const room = this.roomManager.getRoom(key);
      if (room == null) {
        logger.error(`User (${client.userId}) failed to do host action (${action}) against user (${id}) in room (${key}): Room does not exist`);
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
      logger.trace(`User (${client.userId}) requesting settings change in room (${key}): ${JSON.stringify(settings)}`);
      const room = this.roomManager.getRoom(key);
      if (room == null) {
        logger.error(`User (${client.userId}) change settings in room (${key}) failed: Room does not exist`);
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
      logger.trace(`User (${client.userId}) requesting game action (${action}) in room (${key}): ${JSON.stringify(data)}`);
      const room = this.roomManager.getRoom(key);
      if (room == null) {
        logger.error(`User (${client.userId}) game action (${action}) in room (${key}) failed: Room does not exist`);
        client.emit('message', {status: 'error', text: "Room does not exist"});
        client.disconnect();
        return;
      }
      room.gameAction(client.userId, action, data, (err, changes, options) => {
        if (err) {
          client.emit('message', {status: 'error', text: err});
        }
        this.broadcastChanges(room, changes, options);
      });
    });
  }
  
  broadcastChanges(room, changes, options) {
    const {sendSecrets} = options ? options : false;

    if (sendSecrets && room.game.state) {
      const players = room.game.state.players;
      const secrets = room.game.secrets;
      for (const player of players) {
        if (player.client.status === 'connected') {
          let playerView = changes;
          if (secrets.hasOwnProperty(player.id)) {
            // player has secrets (player view)
            playerView = this.addPlayerView(changes, players, secrets[player.id]);
          }
          this.ioRoomServer.to(player.client.id).emit('changes', playerView);
        }
      }
      if (changes) {
        // I'm just hacking now....
        if (!changes.game) {
          changes.game = {state: {}};
        } else if (!changes.game.state) {
          changes.game.state = {};
        }
        changes.game.state.players = room.game.state.players.toArray();
        // end hack
        this.ioRoomServer.to(`${room.key}#spectators`).emit('changes', changes);
      }
    } else {
      if (changes) {
        this.ioRoomServer.to(room.key).emit('changes', changes);
      }
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
    
    if (!changes) {
      changes = {game: {state: {}}};
    } else if (!changes.game) {
      changes.game = {state: {}};
    } else if (!changes.game.state) {
      changes.game.state = {};
    }
    
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