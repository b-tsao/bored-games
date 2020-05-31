export default class PrefixTree {
  root: PrefixNode;

  constructor() {
    this.root = new PrefixNode();
  }

  add(key: string, value: any) {
    const node = this._getNode(key, true);

    if (node === null) {
      return false;
    } else if (node.prefix) {
      return false;
    } else {
      node.prefix = value;
      return true;
    }
  }

  get(key: string) {
    const node = this._getNode(key);
    if (!node) {
      return null;
    } else {
      return node.prefix;
    }
  }

  remove(key: string) {
    let node: PrefixNode | undefined | null = this._getNode(key);

    if (!node) {
      return null;
    }

    const prefix = node.prefix;
    node.prefix = null;

    // We've verified the prefix existed, now to clean up tree.
    let i = key.length - 1;
    while (node && node.getChildren().length === 0 && i >= 0) {
      const k = key[i];
      node = node.parent;
      if (node !== undefined) {
        node.removeChild(k);
      }
      i--;
    }

    return prefix;
  }

  /**
   * Gets the node associated with the key.
   *
   * @return node if room associated with key, null if key not being associated with any rooms. If add = true then this should never return null.
   */
  _getNode(key: string, add = false) {
    const keys = key.split('');

    let node = this.root;
    for (const k of keys) {
      const parent = node;
      node = parent.getChild(k);
      if (!node) {
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
  prefix: any;
  parent: PrefixNode | undefined;
  children: object;


  constructor(parent?: PrefixNode) {
    this.prefix = null;
    this.parent = parent;
    this.children = {};
  }

  getChildren() {
    return Object.keys(this.children);
  }

  getChild(key: string) {
    return this.children[key];
  }

  addChild(key: string) {
    return this.children[key] = new PrefixNode(this);
  }

  removeChild(key: string) {
    delete this.children[key];
  }
}