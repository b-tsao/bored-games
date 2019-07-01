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
    }
    logger.info(`Game (${game}) room (${room.key}) created`);
    return room.key;
  }
  
  /**
   * Removes the client from .
   *
   * @return {Object<key: String, data: null>} room associated with key, null if the key is not associated with any rooms.
   */
  removeClient(key, client) {
    logger.trace(`Removing client (${client.id}) from room (${key})`);
    const room = this.roomManager.getRoom(key);
    
    // TODO make more efficient
    let idx = room.data.spectators.indexOf(client.id);
    if (idx >= 0) {
      room.data.spectators.splice(idx, 1);
    } else {
      idx = room.data.players.indexOf(client.id);
      if (idx >= 0) {
        room.data.players.splice(idx, 1);
      } else {
        logger.error(`Failed to remove client (${client.id}) from room (${key}): client not in room`);
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
   * @return true if successful, false otherwise.
   */
  joinRoom(key, client) {
    logger.trace(`Client (${client.id}) attempting to join room (${key})`);
    const room = this.roomManager.getRoom(key);
    if (room == null) {
      logger.error(`Client (${client.id}) failed to join room (${key}): room does not exist`);
      return false;
    }
    room.data.spectators.push(client.id);
    logger.info(`Client (${client.id}) joined room (${key})`);
    return true;
  }
  
  /**
   * Get the room associated with the key.
   *
   * @return room data if successful, throws an error otherwise.
   */
  getRoom(key) {
    const room = this.roomManager.getRoom(key);
    if (room == null) {
      throw new ReferenceError("Room does not exist");
    }
    return room.data;
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
}

module.exports = GameRoomManager;