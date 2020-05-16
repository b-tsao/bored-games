'use strict';

class LinkedHashMap {
  constructor() {
    this.map = {};
    this.head = null;
    this.tail = null;
    this.length = 0;
    this.array = null;
  }
  
  toJSON() {
    return this.toArray();
  }
  
  toArray() {
    if (!this.array) {
      this.array = [];
      let node = this.head;
      while (node != null) {
        this.array.push(node.data);
        node = node.next;
      }
    }
    return this.array;
  }
  
  [Symbol.iterator]() {
    return {
      current: this.head,
      next: function() {
        const node = this.current;
        if (node != null) {
          this.current = node.next;
          return {value: node.data, done: false};
        } else {
          return {done: true};
        }
      }
    };
  }
  
  getFirst() {
    if (this.head) {
      return this.head.data;
    } else {
      return null;
    }
  }
  
  getLast() {
    if (this.tail) {
      return this.tail.data;
    } else {
      return null;
    }
  }
  
  add(key, value) {
    if (this.map.hasOwnProperty(key)) {
      return false;
    } else if (value == null) {
      value = key;
    }

    const node = {
      data: value,
      prev: this.tail,
      next: null
    };
    
    if (this.tail) {
      this.tail.next = node;
    } else {
      // If tail doesn't exist, head doesn't exist either
      this.head = node;
    }
    this.tail = node;
    this.map[key] = node;
    this.length++;
    this.array = null;
    return true;
  }
  
  remove(key) {
    const node = this.map[key];
    
    if (!node) {
      return null;
    }
    
    this.array = null;
    
    if (node.prev) {
      node.prev.next = node.next;
    } else {
      // node is a head
      this.head = node.next;
    }
    if (node.next) {
      node.next.prev = node.prev;
    } else {
      // node is a tail
      this.tail = node.prev;
    }
    
    delete this.map[key];
    this.length--;
    this.array = null;
    return node.data;
  }
  
  contains(key) {
    return !!this.map[key];
  }
  
  get(key) {
    const node = this.map[key];
    if (node) {
      return node.data;
    } else {
      return null;
    }
  }
  
  clear() {
    for (const key in this.map) {
      const node = this.map[key];
      node.data = null;
      node.prev = null;
      node.next = null;
    }
    
    this.map = {};
    this.head = null;
    this.tail = null;
    this.length = 0;
    this.array = null;
  }
  
  map(modifier) {
    const newMe = new LinkedHashMap();
    
    for (const key in this.map) {
      newMe.add(key, modifier(this.get(key)));
    }
    
    return newMe;
  }
}

module.exports = LinkedHashMap;