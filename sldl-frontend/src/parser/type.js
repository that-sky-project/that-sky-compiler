class Typedef {
  /**
   * @param {Typedef} a
   * @param {Typedef} b
   * @returns {boolean}
   */
  static equal(a, b) {
    if (!a || !b)
      return false;

    if (a.constructor !== b.constructor)
      return false;

    if (a instanceof ArrayOf && a.count !== b.count)
      return false;

    if (a instanceof TypeRef && a.ref !== b.ref)
      return false;

    if (!a.child && !b.child)
      return true;

    if (a.child && b.child)
      return Typedef.equal(a.child, b.child);

    return false;
  }

  /**
   * @param {Typedef} child 
   * @param {AstNode} node 
   */
  constructor(child, node) {
    this.child = child || void 0;
    this.node = node || void 0;
  }
}

class TypeRef extends Typedef {
  /**
   * @param {EnvEntry} child 
   */
  constructor(entry) {
    super();

    this.ref = entry;
  }
}

class PointerTo extends Typedef {
  /**
   * @param {Typedef} child 
   * @param {AstNode} node 
   */
  constructor(child, node) {
    super(child, node);
  }
}

class ArrayOf extends Typedef {
  /**
   * @param {Typedef} child 
   * @param {number} count 
   * @param {AstNode} node 
   */
  constructor(child, count, node) {
    super(child, node);

    this.count = count || 0;
  }
}

module.exports = {
  Typedef,
  TypeRef,
  PointerTo,
  ArrayOf
};
