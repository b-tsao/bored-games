'use strict';

const log4js = require('log4js');

const logger = log4js.getLogger('PeopleManager');

class PeopleManager {
  constructor() {
    this.people = {};
    this.head = null;
    this.tail = null;
    this.length = 0;
    this.array = null;
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
    if (this.people.hasOwnProperty(key)) {
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
    this.people[key] = node;
    if (!this.array) {
      this.array = [];
    }
    this.array.push(node.data);
    this.length++;
    return true;
  }
  
  remove(key) {
    const node = this.people[key];
    
    if (!node) {
      return null;
    }
    
    if (this.array && node === this.tail) {
      this.array.pop();
    } else {
      this.array = null;
    }
    
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
    
    delete this.people[key];
    this.length--;
    return node.data;
  }
  
  contains(key) {
    return !!this.people[key];
  }
  
  get(key) {
    const node = this.people[key];
    if (node) {
      return node.data;
    } else {
      return null;
    }
  }
  
  clear() {
    for (const key in this.people) {
      const node = this.people[key];
      node.data = null;
      node.prev = null;
      node.next = null;
    }
    
    this.people = {};
    this.head = null;
    this.tail = null;
    this.length = 0;
    this.array = null;
  }
  
  map(modifier) {
    const newMe = new PeopleManager();
    
    for (const key in this.people) {
      newMe.add(key, modifier(this.get(key)));
    }
    
    return newMe;
  }
}

module.exports = PeopleManager;