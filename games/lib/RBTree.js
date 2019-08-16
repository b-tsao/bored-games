'use strict';

class RBTree {
  constructor(comparator) {
    this.comparator = comparator ? comparator : (c1, c2) => {return c1 - c2};
    this.root = new RBNode();
  }
  
  add(key) {
    const leaf = this.get(key);
    if (leaf.key == null) {
      leaf.breathe(key);
      this.balance(leaf);
      return true;
    } else {
      return false;
    }
  }
  
  delete(key) {
    const node = this.get(key);
    if (node.key == null) {
      return null;
    }
    
    key = node.key;

    const successor = this.getSuccessor(node);
    node.acquire(successor);
    
    let doubleBlackNode = null;
    
    if (successor.left.key != null) {
      // this is an in order predecessor so we link left child as right child of parent
      if (successor.left.red) {
        // If child of successor is red, successor can't be red, thus just replace
        successor.left.red = false;
      } else if (!successor.red) {
        // If successor isn't red, then we have double black
        doubleBlackNode = successor.left;
      }
      this.link(successor.parent, successor.left, false);
    } else if (successor.right.key != null) {
      // this is an in order successor so we link right child as left child of parent
      if (successor.right.red) {
        // If child of successor is red, successor can't be red, thus just replace
        successor.right.red = false;
      } else if (!successor.red) {
        // If successor isn't red, then we have double black
        doubleBlackNode = successor.right;
      }
      this.link(successor.parent, successor.right, true);
    } else {
      if (!successor.red) {
        // If successor isn't red, then we have double black
        doubleBlackNode = successor;
      }
    }
    
    successor.croak();
    
    this.handleDoubleBlack(doubleBlackNode);
    
    return key;
  }
  
  clear() {
    this.destroy(this.root);
  }

  destroy(node) {
    for (const child of node.children) {
      this.destroy(child);
    }
    node.croak();
  }
  
  handleDoubleBlack(node) {
    if (node == null || node.parent == null) {
      // no double black or double black node is now root, no action needed
      return;
    } else {
      const sibling = (node.isLeft) ? node.parent.right : node.parent.left;
      if (node.parent.red) {
        node.parent.red = false;
        sibling.red = true;
      } else {
        if (node.isLeft) {
          if (sibling.red) {
            this.leftRotate(sibling);
            sibling.red = false;
            sibling.left.red = true;
            this.handleDoubleBlack(node);
          } else if (sibling.left.red && !sibling.right.red) {
            this.rightRotate(sibling.left);
            sibling.red = true;
            sibling.parent.red = false;
            this.handleDoubleBlack(node);
          } else if (!sibling.left.red && sibling.right.red) {
            this.leftRotate(sibling);
            sibling.red = sibling.left.red;
            sibling.right.red = false;
          } else if (!sibling.left.red && !sibling.right.red) {
            sibling.red = true;
            this.handleDoubleBlack(node.parent);
          }
        } else {
          if (sibling.red) {
            this.rightRotate(sibling);
            sibling.red = false;
            sibling.right.red = true;
            this.handleDoubleBlack(node);
          } else if (!sibling.left.red && sibling.right.red) {
            this.leftRotate(sibling.right);
            sibling.red = true;
            sibling.parent.red = false;
            this.handleDoubleBlack(node);
          } else if (sibling.left.red && !sibling.right.red) {
            this.rightRotate(sibling);
            sibling.red = sibling.right.red;
            sibling.left.red = false;
          } else if (!sibling.left.red && !sibling.right.red) {
            sibling.red = true;
            this.handleDoubleBlack(node.parent);
          }
        }
      }
    }
  }
  
  getSuccessor(node) {
    if (node.right.key != null) {
      return this.getInOrderSuccessor(node);
    } else if (node.left.key != null) {
      return this.getInOrderPredecessor(node);
    } else {
      return node;
    }
  }
  
  getInOrderSuccessor(node) {
    let successor = node.right;
    while (successor.left.key != null) {
      successor = successor.left;
    }
    return successor;
  }
  
  getInOrderPredecessor(node) {
    let successor = node.left;
    while (node.right.key != null) {
      successor = successor.right;
    }
    return successor;
  }
  
  get(key, compare) {
    if (!compare) {
      compare = this.comparator;
    }
    
    let node = this.root;
    while (node.key != null) {
      const res = compare(key, node.key);
      if (res < 0) {
        node = node.left;
      } else if (res > 0) {
        node = node.right;
      } else {
        return node;
      }
    }
    return node;
  }
  
  balance(node) {
    const parent = node.parent;
    if (parent && parent.red) {
      const grandparent = node.parent.parent;
      
      if (grandparent == null) {
        // parent is root, just switch colors
        return this.paintFamily(node.parent);
      }
      
      const uncle = node.parent.isLeft ? grandparent.right : grandparent.left;
      
      if (uncle.red) {
        // Uncle is also red, just switch colors
        this.paintFamily(node.parent);
      } else {
        if (parent.isLeft) {
          if (node.isLeft) {
            this.rightRotate(node.parent);
            node.parent.red = false;
            node.parent.right.red = true;
          } else {
            this.leftRotate(node);
            this.rightRotate(node);
            node.red = false;
            node.right.red = true;
          }
        } else {
          if (node.isLeft) {
            this.rightRotate(node);
            this.leftRotate(node);
            node.red = false;
            node.left.red = true;
          } else {
            this.leftRotate(node.parent);
            node.parent.red = false;
            node.parent.left.red = true;
          }
        }
        return;
      }
    }
  }
  
  leftRotate(node) {
    // grandparent-parent-node to grandparent-node-parent<left child>
    const parent = node.parent;
    const grandparent = parent.parent;
    // Set node-grandparent relationship to node-parent relationship
    this.link(grandparent, node, parent.isLeft);
    // Since we're left rotating, parent's right child was node, thus we save node's left child to parent's right child
    this.link(parent, node.left, false);
    // Set node-parent relationship to node-left child relationship
    this.link(node, parent, true);
  }
  
  rightRotate(node) {
    // grandparent-parent-node to grandparent-node-parent<right child>
    const parent = node.parent;
    const grandparent = parent.parent;
    // Set node-grandparent relationship to node-parent relationship
    this.link(grandparent, node, parent.isLeft);
    // Since we're right rotating, parent's left child was node, thus we save node's right child to parent's left child
    this.link(parent, node.right, true);
    // Set node-parent relationship to node-right child relationship
    this.link(node, parent, false);
  }
  
  link(parent, child, isLeft) {
    if (parent) {
      parent.adopt(child, isLeft);
    } else {
      child.parent = null;
      this.root = child;
    }
  }
  
  paintFamily(node, red) {
    node.red = red;
    
    if (!node.parent) {
      // root
      return;
    }
    
    const sibling = node.isLeft ? node.parent.right : node.parent.left;
    sibling.red = red;
    
    if (node.red) {
      return this.balance(node);
    }
    
    this.paintFamily(node.parent, !red);
  }
  
  inOrderTraversal(array, node) {
    if (node.key == null) {
      return;
    }
    
    this.inOrderTraversal(array, node.left);
    array.push(node.key);
    this.inOrderTraversal(array, node.right);
  }
}

class RBNode {
  constructor(parent, isLeft) {
    this.key = null;
    this.parent = parent;
    this.red = false;
    this.isLeft = isLeft;
    this.children = [];
  }
  
  get left () {return this.children[0]};
  get right () {return this.children[1]};
  set left (child) {this.children[0] = child};
  set right (child) {this.children[1] = child};
  
  breathe(key) {
    this.key = key;
    this.red = true;
    this.children = [new RBNode(this, true), new RBNode(this, false)];
  }
  
  croak() {
    this.key = null;
    this.red = false;
    this.children = [];
  }
  
  adopt(child, isLeft) {
    child.isLeft = isLeft;
    child.parent = this;
    this.children[isLeft ? 0 : 1] = child;
  }
  
  acquire(target) {
    this.key = target.key;
  }
}

module.exports = RBTree;