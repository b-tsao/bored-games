'use strict';

const log4js = require('log4js');
const uuid = require('uuid/v4');
const PrefixTree = require('./lib/PrefixTree');
const Room = require('./Room');

const logger = log4js.getLogger('RoomManager');

class RoomManager {
  constructor() {
    this.roomTimers = {};
    this.roomTree = new PrefixTree();
  }
  
  /**
   * Create a room with a random key guaranteed to be unique and initial game settings.
   *
   * @return room if successful, throws an error otherwise.
   */
  createRoom(title, callback = () => {}) {
    logger.trace(`Creating game (${title}) room`);
    const room = new Room();
    room.setGame(title, (err) => {
      if (err) {
        return callback(err);
      } else {
        let uid;
        let success = false;
        do {
          uid = uuid().split('-')[0].substring(0, 4).toUpperCase();
          success = this.roomTree.add(uid, room);
        } while (!success);
        room.key = uid;
        logger.info(`Game (${title}) room (${room.key}) created`);
        this.roomTimer(room.key);
        return callback(null, room);
      }
    });
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
  
  /**
   * Deletes the room associated with the key after given amount of time in millis.
  *
   * @param key room key
   * @param timer time in millis to expire room, default 30 minutes
   * @return {Object<key: String, data: null>} room associated with key, null if operation is unsuccessful due to key not being associated with any rooms.
   */
  roomTimer(key, timer) {
    const millis = timer ? timer : 1800000;
    this.clearRoomTimer(key);
    logger.trace(`Room (${key}) will expire after ${millis} millis`)
    const roomTimer = {
      timeout: millis,
      timer: setTimeout(() => {
        this.deleteRoom(key);
        logger.trace(`Room (${key}) has expired after ${roomTimer.timeout} millis`);
      }, millis)
    }
    this.roomTimers[key] = roomTimer;
  }
  
  clearRoomTimer(key) {
    if (this.roomTimers[key]) {
      clearTimeout(this.roomTimers[key].timer);
      delete this.roomTimers[key];
      logger.trace(`Room (${key}) timer cleared`);
    }
  }
  
  /**
   * Deletes the room associated with the key.
   *
   * @return {Object<key: String, data: null>} room associated with key, null if operation is unsuccessful due to key not being associated with any rooms.
   */
  deleteRoom(key) {
    this.clearRoomTimer(key);
    const room = this.roomTree.remove(key.toUpperCase());
    if (room) {
      logger.info(`Room (${key}) deleted`);
      return room;
    }
  }
}

module.exports = RoomManager;