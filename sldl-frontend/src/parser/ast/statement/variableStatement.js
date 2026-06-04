/**
 * Object constant declaration statement.
 *
 * Copyright (c) 2026 That Sky Project
 * LGPL-3.0-or-later
 */

const { kBulitInExceptions } = require("sldl-utils");
const { kTokenReserved, kTokenType } = require("../../../lexer/token.js");
const { EnvEntry, kEnvEntryType } = require("../../env.js");
const { AstNode } = require("../astNode.js");
const { Statement } = require("./statement.js");
const { Reference } = require("../expression/reference.js");
const { InitList } = require("../initList.js");

/** Represents an object constant declaration  TypeName varName = { ... };  */
class VariableStatement extends Statement {
  /**
   * @param {Token} token - The type-name token.
   */
  constructor(token) {
    super(token);

    /** @type {Token} The type name. */
    this.typeName = void 0;
    /** @type {Token} The variable name. */
    this.name = void 0;
    /** @type {InitList} The initializer. */
    this.init = void 0;
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
      // Panic til ";"
      P.moveTil(kTokenReserved.Semicolon);
      P.move();
      return false;
    }
  }

  /**
   * Parse an object constant declaration.
   *
   * <VariableStatement>:
   *   <Identifier> <Identifier> = <InitList> ;
   *
   * The first identifier must be a struct or class type already registered
   * in the symbol table.  Primitive types are not allowed.  An initializer
   * is mandatory.
   *
   * Entry: look -> <Identifier> for type name.
   * Exit: look -> after ";"
   *
   * @param {CompilerParser} P - Parser.
   * @param {Env} E - Symbol table.
   */
  syntax(P, E) {
    // Type name - must be a registered struct or class.
    var typeToken = P.look
      , typedef = E.get(typeToken);

    if (!typedef || !typedef.isType() || typedef.isPrimitive())
      this.error(kBulitInExceptions.InvalidType, typeToken);

    this.typeName = typeToken;

    // Skip type name.
    P.move();

    // Variable name.
    P.match(kTokenType.Identifier);
    this.name = P.look;

    // Skip name.
    P.move();

    // "="
    P.match(kTokenReserved.Assign);
    P.move();

    // <InitList>
    P.match(kTokenReserved.BraceL);
    this.init = new InitList(P.look);
    this.init.parse(P, E);

    // ";"
    P.match(kTokenReserved.Semicolon);
    P.move();

    // Register as a constant in the symbol table.
    var ref = new Reference(this.name, typedef.node, this.init);
    E.put(new EnvEntry(kEnvEntryType.Variable, this.name.content, ref));
  }
}

module.exports = {
  VariableStatement
};
