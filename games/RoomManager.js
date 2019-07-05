'use strict';

const log4js = require('log4js');
const uuid = require('uuid/v4');

const logger = log4js.getLogger('RoomManager');

class RoomManager {
  constructor() {
    this.roomTree = new RoomTree();
  }
  
  /**
   * Creates a room with a random key guaranteed to be unique.
   *
   * @return {Object<key: String, data: null>} unique key that can access the room and data that can store anything.
   */
  createRoom() {
    let room = null;
    do {
      let uid = uuid().split('-')[0].toUpperCase().substring(0, 4);
      room = this.roomTree.add(uid);
    } while (!room);
    return room;
  }
  
  /**
   * Retrieves the room associated with the key.
   *
   * @return {Object<key: String, data: null>} room associated with key, null if the key is not associated with any rooms.
   */
  getRoom(key) {
    return this.roomTree.get(key.toUpperCase());
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

class Room {
  constructor(key, data) {
    this.key = key;
    this.data = data;
  }
}
  
class RoomTree {
  constructor() {
    this.root = new RoomNode();
  }
  
  add(key) {
    const keys = key.split('');
    
    const node = this._getNode(key, true);
    
    if (node.room) {
      return null;
    } else {
      return node.room = new Room(key, null);
    }
  }
  
  get(key) {
    const node = this._getNode(key);
    if (!node) {
      return null;
    } else {
      return node.room;
    }
  }
  
  remove(key) {
    let node = this._getNode(key);
    
    if (!node) {
      return null;
    }
    
    const room = node.room;
    node.room = null;
    
    // We've verified the room existed, now to clean up tree.
    let i = key.length - 1;
    while (node.getChildren().length === 0 && i >= 0) {
      const k = key[i];
      node = node.parent;
      node.removeChild(k);
      i--;
    }

    return room;
  }
  
  /**
   * Gets the node associated with the key.
   *
   * @return node if room associated with key, null if key not being associated with any rooms. If add = true then this should never return null.
   */
  _getNode(key, add = false) {
    const keys = key.split('');
    
    let node = this.root;
    for (const k of keys) {
      const parent = node;
      if (!(node = parent.getChild(k))) {
        if (add) {
          node = parent.addChild(k);
        } else {
          return null;
        }
      }
    }
    
    return node;
  }
}

class RoomNode {
  constructor(parent) {
    this.room = null;
    this.parent = parent;
    this.children = {};
  }
  
  getChildren() {
    return Object.keys(this.children);
  }
  
  getChild(key) {
    return this.children[key];
  }
  
  addChild(key) {
    return this.children[key] = new RoomNode(this);
  }
  
  removeChild(key) {
    delete this.children[key];
  }
}

module.exports = RoomManager;