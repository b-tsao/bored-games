import log4js from 'log4js';
import shortid from 'shortid';
import PrefixTree from './lib/PrefixTree';
import Room from './Room';
import { AnyFunction } from './types';

const logger = log4js.getLogger('RoomManager');

interface RoomTimer {
  key?: { timeout: number, timer: NodeJS.Timeout };
}

class RoomManager {
  roomTimers: RoomTimer;
  roomTree: PrefixTree;

  constructor() {
    this.roomTimers = {};
    this.roomTree = new PrefixTree();
  }

  /**
   * Create a room with a random key guaranteed to be unique and initial game settings.
   *
   * @return room if successful, throws an error otherwise.
   */
  createRoom(game: any, callback: AnyFunction) {
    logger.trace(`Creating game (${game.id}) room`);
    try {
      const room = new Room(game);
      let uid = 'default';
      let success = false;
      do {
        uid = shortid.generate().substring(0, 4).toUpperCase();
        success = this.roomTree.add(uid, room);
      } while (!success);
      room.key = uid;
      logger.info(`Game (${game.id}) room (${room.key}) created`);
      this.roomTimer(room.key, 300000); // If no one joins within 5 minutes, expire room
      return callback(null, room);
    } catch (err) {
      logger.error(`Failed to create game (${game.id}) room: ${err}`);
      return callback(err);
    }
  }

  /**
   * Retrieves the room associated with the key.
   *
   * @return Room associated with key, null if the key is not associated with any rooms.
   */
  getRoom(key: string): Room | null {
    if (key == null) {
      return null;
    }
    return this.roomTree.get(key);
  }

  /**
   * Deletes the room associated with the key after given amount of time in millis.
   *
   * @param key room key
   * @param timer time in millis to expire room, default 30 minutes
   */
  roomTimer(key: string, timer = 1800000) {
    this.clearRoomTimer(key);
    logger.info(`Room (${key}) will expire after ${timer} millis`);
    const roomTimer = {
      timeout: timer,
      timer: setTimeout(() => {
        this.deleteRoom(key);
        logger.info(`Room (${key}) has expired after ${roomTimer.timeout} millis`);
      }, timer)
    };
    this.roomTimers[key] = roomTimer;
  }

  clearRoomTimer(key: string) {
    if (this.roomTimers[key]) {
      clearTimeout(this.roomTimers[key].timer);
      delete this.roomTimers[key];
      logger.info(`Room (${key}) timer cleared`);
    }
  }

  /**
   * Deletes the room associated with the key.
   *
   * @return Room associated with key, null if operation is unsuccessful due to key not being associated with any rooms.
   */
  deleteRoom(key: string): Room | null {
    this.clearRoomTimer(key);
    const room = this.roomTree.remove(key);
    if (room) {
      logger.info(`Room (${key}) deleted`);
      room.dispose();
      return room;
    } else {
      return null;
    }
  }
}

export default new RoomManager();