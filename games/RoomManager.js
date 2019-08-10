'use strict';

const log4js = require('log4js');
const uuid = require('uuid/v4');
const PrefixTree = require('./lib/PrefixTree');
const Room = require('./Room');

const logger = log4js.getLogger('RoomManager');

class RoomManager {
  constructor() {
    this.roomTree = new PrefixTree();
  }
  
  /**
   * Create a room with a random key guaranteed to be unique and initial game settings.
   *
   * @return room key if successful, throws an error otherwise.
   */
  createRoom(title) {
    logger.trace(`Creating game (${title}) room`);
    const room = new Room(title);
    let uid;
    let success = false;
    do {
      uid = uuid().split('-')[0].substring(0, 4).toUpperCase();
      success = this.roomTree.add(uid, room);
    } while (!success);
    room.key = uid;
    logger.info(`Game (${title}) room (${room.key}) created`);
    return room.key;
  }
  
  /**
   * Retrieves the room associated with the key.
   *
   * @return {Object<key: String, data: null>} room associated with key, null if the key is not associated with any rooms.
   */
  get(key) {
    if (key == null) {
      return null;
    }
    return this.roomTree.get(key.toUpperCase());
  }
  
  /**
   * Get the room associated with the key.
   *
   * @return room data if successful, null otherwise.
   */
  getRoom(key) {
    const room = this.get(key);
    if (room == null) {
      return null;
    }
    return room.toJSON();
  }
  
  /**
   * Join a client to the room associated with the key.
   *
   * @return err message if fail, null if success.
   */
  joinRoom(key, id) {
    logger.trace(`Client (${id}) attempting to join room (${key})`);
    const room = this.get(key);
    
    let reason;
    if (room == null) {
      reason = "Room does not exist";
    } else {
      reason = room.addSpectator(id);
    }
    
    if (reason) {
      logger.error(`Client (${id}) failed to join room (${key}): ${reason}`);
      return reason;
    }
    
    logger.info(`Client (${id}) joined room (${key})`);
    return null;
  }
  
  /**
   * Join a client to the game in the room associated with the key.
   *
   * @return err message if fail, null if success.
   */
  joinGame(key, id, name) {
    logger.trace(`Client (${id}) attempting to join game in room (${key}) as name (${name})`);
    const room = this.get(key);
    
    let reason;
    if (room == null) {
      reason = "Room does not exist";
    } else {
      reason = room.addPlayer(id, name);
    }
    
    if (reason) {
      logger.error(`Client (${id}) failed to join game in room (${key}) as name (${name}): ${reason}`);
      return reason;
    }
    
    logger.info(`Client (${id}) joined game in room (${key}) as name (${name})`);
    return null;
  }
  
  /**
   * Removes the client from room associated with key.
   *
   * @return true if successful, false otherwise.
   */
  removeClient(key, id) {
    logger.trace(`Removing client (${id}) from room (${key})`);
    const room = this.get(key);
    
    if (room == null) {
      logger.error(`Removing client (${id}) from room (${key}) failed: Room does not exist`);
      return false;
    }
    
    if (room.remove(id)) {
      logger.info(`Removed client (${id}) from room (${key})`);
      if (room.occupants === 0) {
        logger.trace(`Deleting room (${key}): Room empty`);
        this.deleteRoom(key);
      }
      return true;
    } else {
      return false;
    }
  }
  
  /**
   * Does a host action against another player.
   *
   * @return null if success, error message otherwise.
   */
  hostAction(key, action, sourceId, targetId) {
    logger.trace(`Client (${sourceId}) host action (${action}) against client (${targetId}) in room (${key})`);
    const room = this.get(key);
    let reason = null;
    if (room == null) {
      reason = "Room does not exist";
    } else {
      reason = room.hostAction(action, sourceId, targetId);
    }
    
    if (reason) {
      logger.error(`Client (${sourceId}) host action (${action}) against client (${targetId}) in room (${key}) failed: ${reason}`);
      return reason;
    }
    logger.info(`Client (${sourceId}) host action (${action}) against client (${targetId}) in room (${key}) completed`);
    return null;
  }
  
  gameAction(key, id, action, data) {
    logger.trace(`Client (${id}) game action (${action}) in room (${key})`);
    const room = this.get(key);
    let reason = null;
    if (room == null) {
      reason = "Room does not exist";
    } else {
      reason = room.gameAction(id, action, data);
    }
    
    if (reason) {
      logger.error(`Client (${id}) game action (${action}) in room (${key}) failed: ${reason}`);
      return reason;
    }
    logger.info(`Client (${id}) game action (${action}) in room (${key}) completed`);
    return null;
  }
  
  getPlayerSecrets(key) {
    const room = this.get(key);
    let reason = null;
    if (room == null) {
      return null;
    } else {
      return room.getPlayerSecrets();
    }
  }
  
  changeSettings(key, id, settings) {
    logger.trace(`Client (${id}) change settings in room (${key})`);
    const room = this.get(key);
    let reason = null;
    if (room == null) {
      reason = "Room does not exist";
    } else {
      reason = room.changeSettings(id, settings);
    }
    
    if (reason) {
      logger.error(`Client (${id}) change settings in room (${key}) failed: ${reason}`);
      return reason;
    }
    logger.info(`Client (${id}) change settings in room (${key}) completed`);
    return null;
  }
  
  /**
   * Clean changes in the room associated with the key.
   *
   * @return room changes if successful, null otherwise.
   */
  cleanChanges(key) {
    const room = this.get(key);
    if (room == null) {
      return null;
    }
    return room.cleanChanges();
  }
  
  /**
   * Deletes the room associated with the key.
   *
   * @return {Object<key: String, data: null>} room associated with key, null if operation is unsuccessful due to key not being associated with any rooms.
   */
  deleteRoom(key) {
    return this.roomTree.remove(key.toUpperCase());
  }
}

module.exports = RoomManager;