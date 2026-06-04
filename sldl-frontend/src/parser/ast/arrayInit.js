/**
 * Array initializer AST node for ordered / positional initializers.
 *
 * Parses [ ... ] syntax for array and ordered initialization.
 *
 * Copyright (c) 2026 That Sky Project
 * LGPL-3.0-or-later
 */

const { kBulitInExceptions } = require("sldl-utils");
const { kTokenReserved, kTokenType } = require("../../lexer/token.js");
const { AstNode } = require("./astNode.js");
const { Constant } = require("./expression/constant.js");
const { Reference } = require("./expression/reference.js");

/** Represents a bracket-enclosed ordered initializer  [ ... ]. */
class ArrayInit extends AstNode {
  /**
   * @param {Token} token - Token "["
   */
  constructor(token) {
    super(token);

    /**
     * Array of value expressions.
     * @type {AstNode[]}
     */
    this.elements = [];
  }

  /**
   * @param {CompilerParser} P - Parser.
   * @param {Env} E - Symbol table.
   * @returns {boolean}
   */
  parse(P, E) {
    try {
      this.syntax(P, E);
      return true;
    } catch (e) {
      P.onerror(e);
      // Panic til "]"
      P.moveTil(kTokenReserved.BracketR);
      P.move();
      return false;
    }
  }

  /**
   * Parse a bracket-enclosed ordered initializer.
   *
   * <ArrayInit>:
   *   [ ]
   *   [ <ArrayElements> ]
   *
   * <ArrayElements>:
   *   <Expression>
   *   <ArrayElements> , <Expression>
   *
   * Entry: look -> "["
   * Exit: look -> after "]"
   *
   * @param {CompilerParser} P - Parser.
   * @param {Env} E - Symbol table.
   */
  syntax(P, E) {
    // "["
    P.match(kTokenReserved.BracketL);
    this.relocate(P.look);
    P.move();

    // Empty: [ ]
    if (P.test(kTokenReserved.BracketR)) {
      P.move();
      return;
    }

    // Non-empty list.
    for (;;) {
      this.elements.push(this._parseElement(P, E));

      if (!P.test(kTokenReserved.Comma))
        break;
      P.move();

      // Allow trailing comma before "]".
      if (P.test(kTokenReserved.BracketR))
        break;
    }

    // "]"
    P.match(kTokenReserved.BracketR);
    P.move();
  }

  // -- internal ------------------------------------------------------------

  /**
   * Parse a single array element.
   *
   * <Expression>:
   *   <Number>
   *   <String>
   *   <Identifier>
   *   true | false
   *   <InitList>
   *   <ArrayInit>
   *
   * @param {CompilerParser} P - Parser.
   * @param {Env} E - Symbol table.
   * @returns {AstNode}
   */
  _parseElement(P, E) {
    // Nested init list.
    if (P.test(kTokenReserved.BraceL)) {
      var { InitList } = require("./initList.js");
      var nested = new InitList(P.look);
      nested.syntax(P, E);
      return nested;
    }

    // Nested array init.
    if (P.test(kTokenReserved.BracketL)) {
      var arr = new ArrayInit(P.look);
      arr.syntax(P, E);
      return arr;
    }

    // Numeric literal.
    if (P.test(kTokenType.Number)) {
      var num = new Constant(P.look);
      num.parse(P, E);
      return num;
    }

    // String literal.
    if (P.test(kTokenType.String)) {
      var str = new Constant(P.look);
      str.parse(P, E);
      return str;
    }

    // Boolean literal.
    if (P.test(kTokenReserved.True)) {
      var t = new Constant(P.look);
      t.parse(P, E);
      return t;
    }

    if (P.test(kTokenReserved.False)) {
      var f = new Constant(P.look);
      f.parse(P, E);
      return f;
    }

    // Identifier reference.
    if (P.test(kTokenType.Identifier)) {
      var ref = new Reference(P.look);
      P.move();
      return ref;
    }

    throw kBulitInExceptions.Unexpected.from(P.look);
  }
}

module.exports = {
  ArrayInit
};
