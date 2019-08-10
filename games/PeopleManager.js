'use strict';

const log4js = require('log4js');
const RBTree = require('./lib/RBTree');

const logger = log4js.getLogger('PeopleManager');

class PeopleManager {
  constructor(comparator) {
    let compare = null;
    if (comparator) {
      compare = (c1, c2) => {return comparator(c1.data, c2.data)};
    } else {
      compare = (c1, c2) => {
        if (c1.data < c2.data) return -1;
        else if (c1.data > c2.data) return 1;
        else return 0;
      };
    }
    this.tree = new RBTree(compare);
    this.head = null;
    this.tail = null;
    this.length = 0;
  }
  
  get people() {
    const array = [];
    let wrapper = this.head;
    while (wrapper != null) {
      array.push(wrapper.data);
      wrapper = wrapper.next;
    }
    return array;
  }
  
  toJSON() {
    return this.people;
  }
  
  cleanChanges() {
    return this.people;
  }
  
  add(person) {
    const wrapper = {
      data: person,
      prev: this.tail,
      next: null
    };
    
    if (this.tree.add(wrapper)) {
      if (this.head == null) {
        this.head = wrapper;
      }
      if (this.tail != null) {
        this.tail.next = wrapper;
      }
      this.tail = wrapper;
      this.length++;
      return true;
    } else {
      return false;
    }
  }
  
  remove(person) {
    const wrapper = this.tree.delete({data: person});
    if (wrapper) {
      if (wrapper.prev) {
        wrapper.prev.next = wrapper.next;
      } else {
        this.head = wrapper.next;
      }
      if (wrapper.next) {
        wrapper.next.prev = wrapper.prev;
      } else {
        this.tail = wrapper.prev;
      }
      this.length--;
      return wrapper.data;
    }
    return null;
  }
  
  contains(person, compare) {
    if (this.get(person, compare)) {
      return true;
    } else {
      return false;
    }
  }
  
  get(person, comparator) {
    let compare = null;
    if (comparator) {
      compare = (c1, c2) => {return comparator(c1.data, c2.data)};
    }
    const wrapper = this.tree.get({data: person}, compare).key;
    if (wrapper) {
      return wrapper.data;
    } else {
      return null;
    }
  }
}

module.exports = PeopleManager;