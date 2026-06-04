/**
 * Reference AST node.
 * 
 * Represents an identifier reference or a named constant entry in the symbol
 * table.
 *
 * Copyright (c) 2026 That Sky Project
 * LGPL-3.0-or-later
 */

const { kBulitInExceptions } = require("sldl-utils");
const { kTokenType } = require("../../../lexer/token.js");
const { EnvEntry } = require("../../env.js");
const { Expression } = require("./expression.js");

/** Represents an identifier reference or constant symbol-table entry. */
class Reference extends Expression {
  constructor() {
    super();

    /**
     * The identifier name token.
     * @type {Token}
     */
    this.name = void 0;
    /**
     * Reference to the original type declaration EnvEntry.
     * @type {EnvEntry}
     */
    this.type = void 0;
  }

  /**
   * @param {CompilerParser} P - Parser.
   * @param {Env} E - Symbol table.
   * @returns {boolean}
   */
  parse(P, E) {
    try {
      this.syntax(P, E, struct);
      return true;
    } catch (e) {
      P.onerror(e);
      P.move();
      // Directly return whatever P.look.
      return false;
    }
  }

  /**
   * Parse a variable reference.
   * 
   * <Reference>:
   *   <Identifier>
   * 
   * Entry: look -> <Identifier>.
   * Exit: look -> After <Identifier>.
   * 
   * @param {CompilerParser} P - Parser.
   * @param {Env} E - Symbol table.
   */
  syntax(P, E) {
    P.match(kTokenType.Identifier);
    this.name = P.look;
    this.relocate(this.name);

    var def = E.get(this.name.raw());
    if (!def)
      // Reference must be declared.
      throw kBulitInExceptions.Undeclared.from(this.name);
    if (!def.isReference())
      throw kBulitInExceptions.InvalidRef.from(this.name);

    this.type = def.vartype;

    P.move();
  }

  /**
   * Get the name in a string.
   * @returns {string}
   */
  getName() {
    return this.name ? this.name.raw() : "";
  }

  toString() {
    return this.getName();
  }
}

module.exports = {
  Reference
};
