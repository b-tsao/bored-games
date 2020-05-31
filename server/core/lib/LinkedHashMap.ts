import { AnyFunction } from '../types';

interface Node {
  data: any;
  prev: Node | null;
  next: Node | null;
}

export default class LinkedHashMap {
  nodes: { key?: Node };
  head: Node | null;
  tail: Node | null;
  length: number;
  array: any[] | null;

  constructor() {
    this.nodes = {};
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
      let node: Node | null = this.head;
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
      next() {
        const node = this.current;
        if (node != null) {
          this.current = node.next;
          return { value: node.data, done: false };
        } else {
          return { done: true };
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

  add(key: string, value: any) {
    if (this.nodes.hasOwnProperty(key)) {
      return false;
    } else if (value == null) {
      value = key;
    }

    const node: Node = {
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
    this.nodes[key] = node;
    this.length++;
    this.array = null;
    return true;
  }

  remove(key: string) {
    const node = this.nodes[key];

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

    delete this.nodes[key];
    this.length--;
    this.array = null;
    return node.data;
  }

  contains(key: string) {
    return !!this.nodes[key];
  }

  get(key: string) {
    const node = this.nodes[key];
    if (node) {
      return node.data;
    } else {
      return null;
    }
  }

  clear() {
    for (const key in this.nodes) {
      const node = this.nodes[key];
      node.data = null;
      node.prev = null;
      node.next = null;
    }

    this.nodes = {};
    this.head = null;
    this.tail = null;
    this.length = 0;
    this.array = null;
  }

  map(modifier: AnyFunction) {
    const newMe = new LinkedHashMap();

    for (const key in this.nodes) {
      newMe.add(key, modifier(this.get(key)));
    }

    return newMe;
  }
}