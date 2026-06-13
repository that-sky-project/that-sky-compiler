const { kBulitInExceptions } = require("../../../exceptions.js");
const { kTokenType } = require("../../../lexer/token.js");
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
   * @param {EnvEntry} type
   */
  setType(type) {
    this.type = type;
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
   * @param {EnvEntry} [type] - Variable type.
   */
  syntax(P, E, type) {
    P.match(kTokenType.Identifier);
    this.name = P.look;
    this.relocate(this.name);

    // Resolve the reference from Env if no explicit type provided.
    if (!type) {
      var entry = E.get(this.name);
      if (!entry)
        this.error(kBulitInExceptions.Undeclared, this.name);
      this.type = entry;
    } else {
      this.type = type;
    }

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
