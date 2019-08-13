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
   * @return room if successful, throws an error otherwise.
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
    return room;
  }
  
  /**
   * Retrieves the room associated with the key.
   *
   * @return {Object<key: String, data: null>} room associated with key, null if the key is not associated with any rooms.
   */
  getRoom(key) {
    if (key == null) {
      return null;
    }
    return this.roomTree.get(key.toUpperCase());
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