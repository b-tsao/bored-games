'use strict';

class PrefixTree {
  constructor() {
    this.root = new PrefixNode();
  }
  
  add(key, value) {
    const keys = key.split('');
    const node = this._getNode(key, true);
    
    if (node.prefix) {
      return false;
    } else {
      node.prefix = value;
      return true;
    }
  }
  
  get(key) {
    const node = this._getNode(key);
    if (!node) {
      return null;
    } else {
      return node.prefix;
    }
  }
  
  remove(key) {
    let node = this._getNode(key);
    
    if (!node) {
      return null;
    }
    
    const prefix = node.prefix;
    node.prefix = null;
    
    // We've verified the prefix existed, now to clean up tree.
    let i = key.length - 1;
    while (node.getChildren().length === 0 && i >= 0) {
      const k = key[i];
      node = node.parent;
      node.removeChild(k);
      i--;
    }

    return prefix;
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

class PrefixNode {
  constructor(parent) {
    this.prefix = null;
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
    return this.children[key] = new PrefixNode(this);
  }
  
  removeChild(key) {
    delete this.children[key];
  }
}

module.exports = PrefixTree;