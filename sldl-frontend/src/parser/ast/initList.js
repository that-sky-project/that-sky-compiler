/**
 * Initializer list AST node for named / designated aggregate initializers.
 *
 * Supports C-style designated (.x = 1) and JSON-style named (x: 1) members.
 * Ordered (positional) initialization uses ArrayInit ([ ... ]) instead.
 *
 * Copyright (c) 2026 That Sky Project
 * LGPL-3.0-or-later
 */

const { kBulitInExceptions } = require("sldl-utils");
const { kTokenReserved, kTokenType } = require("../../lexer/token.js");
const { AstNode } = require("./astNode.js");
const { Constant } = require("./expression/constant.js");
const { Reference } = require("./expression/reference.js");

/** Represents a single named member inside an InitList. */
class InitMember extends AstNode {
  constructor() {
    super();

    /**
     * Property name.
     * @type {Token}
     */
    this.name = void 0;
    /**
     * Value expression.
     * @type {AstNode}
     */
    this.value = void 0;
  }
}

/** Represents a brace-enclosed named initializer  { ... }. */
class InitList extends AstNode {
  /**
   * @param {Token} token - Token "{"
   */
  constructor(token) {
    super(token);

    /**
     * Array of named member nodes.
     * @type {InitMember[]}
     */
    this.members = [];
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
      // Panic til "}"
      P.moveTil(kTokenReserved.BraceR);
      P.move();
      return false;
    }
  }

  /**
   * Parse a brace-enclosed named initializer list.
   *
   * <InitList>:
   *   { }
   *   { <InitListMembers> }
   *
   * <InitListMembers>:
   *   <InitMember>
   *   <InitMember> , <InitListMembers>
   *
   * <InitMember>:
   *   . <Identifier> = <Expression>
   *   <Identifier> : <Expression>
   *
   * Entry: look -> "{"
   * Exit: look -> after "}"
   *
   * @param {CompilerParser} P - Parser.
   * @param {Env} E - Symbol table.
   */
  syntax(P, E) {
    // "{"
    P.match(kTokenReserved.BraceL);
    this.relocate(P.look);
    P.move();

    // Empty list: { }
    if (P.test(kTokenReserved.BraceR)) {
      P.move();
      return;
    }

    // Non-empty list.
    while (true) {
      this.members.push(this._parseMember(P, E));

      if (!P.test(kTokenReserved.Comma))
        // Allow trailing separator before "}".
        break;
      P.move();

      if (P.test(kTokenReserved.BraceR))
        break;
    }

    // "}"
    P.match(kTokenReserved.BraceR);
    P.move();
  }

  // -- internal ------------------------------------------------------------

  /**
   * Parse a single named initializer member.
   *
   * <InitMember>:
   *   . <Identifier> = <Expression>
   *   <Identifier> : <Expression>
   *
   * Entry: look -> first token of member ( "." or identifier ).
   * Exit: look -> after <Expression>.
   *
   * @param {CompilerParser} P - Parser.
   * @param {Env} E - Symbol table.
   * @returns {InitMember}
   */
  _parseMember(P, E) {
    var member = new InitMember();

    // C-style (.name = value)
    if (P.test(kTokenReserved.Dot)) {
      // Skip "."
      P.move();

      P.match(kTokenType.Identifier);
      member.name = P.look;
      member.relocate(member.name);

      // Skip name.
      P.move();

      // "="
      P.match(kTokenReserved.Assign);
      P.move();

      member.value = this._parseValue(P, E);
      return member;
    }

    // JS-style (name : value).
    if (P.test(kTokenType.Identifier)) {
      member.name = P.look;
      member.relocate(member.name);

      // Skip name.
      P.move();

      // ":"
      P.match(kTokenReserved.Colon);
      P.move();

      member.value = this._parseValue(P, E);
      return member;
    }

    throw kBulitInExceptions.Unexpected.from(P.look);
  }

  /**
   * Parse a value expression inside a named initializer.
   *
   * <Value>:
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
  _parseValue(P, E) {
    // Nested init list.
    if (P.test(kTokenReserved.BraceL)) {
      var nested = new InitList(P.look);
      nested.syntax(P, E);
      return nested;
    }

    // Nested array init.
    if (P.test(kTokenReserved.BracketL)) {
      var { ArrayInit } = require("./arrayInit.js");
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
  InitMember,
  InitList
};
