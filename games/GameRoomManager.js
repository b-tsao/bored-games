'use strict';

const log4js = require('log4js');
const RoomManager = require('./RoomManager');

const AvalonSettings = require('./avalon/AvalonSettings');

const logger = log4js.getLogger('GameRoomManager');

class GameRoomManager {
  constructor() {
    this.roomManager = new RoomManager();
  }
  
  /**
   * Create a room with initial game settings.
   *
   * @return room key if successful, throws an error otherwise.
   */
  createRoom(game) {
    logger.trace(`Creating game (${game}) room`);
    let gameSettings;
    switch (game) {
      case 'The Resistance: Avalon':
        gameSettings = AvalonSettings.initialSettings();
        break;
      default:
        const err = new ReferenceError("Game not supported");
        logger.error(`Failed to create game (${game}) room: ${err.message}`);
        throw err;
    }
    
    const room = this.roomManager.createRoom();
    room.data = {
      game,
      settings: gameSettings,
      spectators: [],
      players: []
    };
    room.changes = {};
    logger.info(`Game (${game}) room (${room.key}) created`);
    return room.key;
  }
  
  /**
   * Removes the client from room associated with key.
   *
   * @return {Object<key: String, data: null>} room associated with key, null if the key is not associated with any rooms.
   */
  removeClient(key, client) {
    logger.trace(`Removing client (${client.id}) from room (${key})`);
    const room = this.roomManager.getRoom(key);
    if (room == null) {
      logger.error(`Removing client (${client.id}) from room (${key}) failed: Room does not exist`);
      return false;
    }
    
    let idx = room.data.spectators.indexOf(client.id);
    if (idx >= 0) {
      room.data.spectators.splice(idx, 1);
      this.trackChange(room, ['data', 'spectators']);
    } else {
      idx = room.data.players.map((player) => {return player.id}).indexOf(client.id);
      if (idx >= 0) {
        const player = room.data.players.splice(idx, 1)[0];
        if (player.host && room.data.players.length > 0) {
          room.data.players[0].host = true;
        }
        this.trackChange(room, ['data', 'players']);
      } else {
        logger.error(`Failed to remove client (${client.id}) from room (${key}): Client not in room`);
        return false;
      }
    }
    
    logger.info(`Removed client (${client.id}) from room (${key})`);
    
    const occupants = room.data.spectators.length + room.data.players.length;
    
    if (occupants === 0) {
      logger.trace(`Deleting room (${key}): room empty`);
      this.deleteRoom(key);
    }
    return true;
  }
  
  /**
   * Join a client to the room associated with the key.
   *
   * @return err message if fail, null if success.
   */
  joinRoom(key, client) {
    logger.trace(`Client (${client.id}) attempting to join room (${key})`);
    const room = this.roomManager.getRoom(key);
    
    let reason;
    if (room == null) {
      reason = "Room does not exist";
    } else if (room.data.spectators.indexOf(client.id) >= 0) {
      reason = "Already in the room";
    }
    
    if (reason) {
      logger.error(`Client (${client.id}) failed to join room (${key}): ${reason}`);
      return reason;
    }

    // Just in case client was a player
    const idx = room.data.players.map((player) => {return player.id}).indexOf(client.id);
    if (idx >= 0) {
      const player = room.data.players.splice(idx, 1)[0];
      if (player.host && room.data.players.length > 0) {
        room.data.players[0].host = true;
      }
      this.trackChange(room, ['data', 'players']);
    }
    
    room.data.spectators.push(client.id);
    this.trackChange(room, ['data', 'spectators']);
    logger.info(`Client (${client.id}) joined room (${key})`);
    return null;
  }
  
  /**
   * Join a client to the game in the room associated with the key.
   *
   * @return err message if fail, null if success.
   */
  joinGame(key, client, name) {
    logger.trace(`Client (${client.id}) attempting to join game in room (${key}) as name (${name})`);
    const room = this.roomManager.getRoom(key);
    
    let reason = null;
    if (room == null) {
      reason = "Room does not exist";
    } else if (room.data.settings.hasOwnProperty('maxPlayers') && room.data.players.length >= room.data.settings.maxPlayers) {
      reason = "Room capacity exceeded";
    } else if (room.data.players.map((player) => {return player.id}).indexOf(client.id) >= 0) {
      reason = "Already in the game";
    } else {
      reason = this.checkName(room, name);
    }
    
    if (reason) {
      logger.error(`Client (${client.id}) failed to join game in room (${key}) as name (${name}): ${reason}`);
      return reason;
    }
    
    const host = room.data.players.length === 0;
    
    const idx = room.data.spectators.indexOf(client.id);
    if (idx >= 0) {
      room.data.spectators.splice(idx, 1);
      this.trackChange(room, ['data', 'spectators']);
    }
    room.data.players.push({id: client.id, name, host});
    this.trackChange(room, ['data', 'players']);
    logger.info(`Client (${client.id}) joined game in room (${key}) as name (${name})`);
    return null;
  }
  
  /**
   * Get the room associated with the key.
   *
   * @return room data if successful, null otherwise.
   */
  getRoom(key) {
    return this.roomManager.getRoom(key);
  }
  
  /**
   * Does an action against another player.
   *
   * @return null if success, error message otherwise.
   */
  doHostAction(key, client, action, id) {
    const room = this.roomManager.getRoom(key);
    let reason = null;
    if (room == null) {
      reason = "Room does not exist";
    } else {
      const playersId = room.data.players.map((player) => {return player.id});
      const PlayerIdx = playersId.indexOf(client.id);
      if (PlayerIdx < 0) {
        reason = "Host only action";
      } else {
        const player = room.data.players[PlayerIdx];
        if (player.host) {
          const targetIdx = playersId.indexOf(id);
          if (targetIdx < 0) {
            reason = "Target is not a player";
          } else {
            const target = room.data.players[targetIdx];
            switch (action) {
              case "transferHost":
                player.host = false;
                target.host = true;
                this.trackChange(room, ['data', 'players']);
                break;
              case "kick":
                room.data.spectators.push(id);
                room.data.players.splice(targetIdx, 1)
                this.trackChange(room, ['data', 'spectators']);
                this.trackChange(room, ['data', 'players']);
                break;
              default:
                reason = "Invalid host action";
            }
          }
        } else {
          reason = "Host only action";
        }
      }
    }
    
    if (reason) {
      logger.error(`Client (${client.id}) host action (${action}) against id (${id}) in room (${key}) failed: ${reason}`);
      return reason;
    }
    logger.info(`Client (${client.id}) host action (${action}) against id (${id}) in room (${key})`);
    return null;
  }
  
  /**
   * Get the changes in the room associated with the key.
   *
   * @return room changes if successful, null otherwise.
   */
  getChanges(key) {
    const room = this.roomManager.getRoom(key);
    if (room == null) {
      return null;
    }
    return room.changes;
  }
  
  /**
   * Clean changes in the room associated with the key.
   *
   * @return room changes if successful, null otherwise.
   */
  cleanChanges(key) {
    const room = this.roomManager.getRoom(key);
    if (room == null) {
      return null;
    }
    const changes = room.changes;
    room.changes = {};
    return changes;
  }
  
  /**
   * Deletes the room associated with the key.
   *
   * @return {Object<key: String, data: null>} room associated with key, null if operation is unsuccessful due to key not being associated with any rooms.
   */
  deleteRoom(key) {
    const room = this.roomManager.deleteRoom(key);
    if (room) {
      logger.info(`Room (${key}) deleted`);
    } else {
      logger.error(`Failed to delete room (${key}): room does not exist`);
    }
  }
  
  /**
   * Check if the name is valid.
   *
   * @return err message if invalid, null if valid.
   */
  checkName(room, name) {
    if (name == null) {
      return "Invalid name";
    }
    
    for (const player of room.data.players) {
      if (name === player.name) {
        return "Name already exists";
      }
    }
    return null;
  }
  
  /**
   * Keep track of changes made to room to return so we don't have to return the whole object every time.
   * Ex: (room, ['data', 'settings'])
   */
  trackChange(room, path) {
    let i = 0;
    let assign = room;
    let changes = room.changes;
    while (i < path.length - 1) {
      if (!assign[path[i]]) {
        throw new RangeError('Path does not exist');
      } else {
        assign = assign[path[i]];
      }
      if (!changes[path[i]]) {
        changes[path[i]] = {};
      }
      changes = changes[path[i]];
      i++;
    }
    if (i === path.length - 1) {
      changes[path[i]] = assign[path[i]];
    } else {
      // The whole room changed, which is theoretically impossible
      room.changes = {...room};
      delete room.changes.changes;
    }
  }
}

module.exports = GameRoomManager;