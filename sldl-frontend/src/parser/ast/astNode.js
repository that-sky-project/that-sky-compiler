const { kBulitInExceptions } = require("sldl-utils");

/**
 * Node of abstract syntax tree.
 * 
 * Each AstNode can contain two types of other nodes: reference nodes and child
 * nodes. Reference nodes represent things like the original type declaration and
 * are used only for identification; child nodes are nodes directly derived from
 * productions and are used for semantic computation.
 */
class AstNode {
  /**
   * Check if P.look is the starting token of the current node.
   * @param {CompilerParser} P 
   * @param {Env} E 
   * @returns {boolean}
   */
  static maybe(P, E) {
    return true;
  }

  /**
   * Check if P.look is the starting token of the current node. This function is
   * used to throw an "unexpected ..." error before the caller enters parsing.
   * @param {CompilerParser} P 
   * @param {v} E 
   * @throws {CompileException}
   */
  static match(P, E) {
    if (!this.maybe(P, E))
      throw kBulitInExceptions.Unexpected.from(P.look);
  }

  /**
   * @param {CompilerParser} P 
   * @param {Env} E 
   * @param  {...any} args 
   * @returns {(T:Token,...V:any[])=>AstNode|undefined}
   */
  static parse(P, E, ...args) {
    var self = this;
    return function (T, ...V) {
      var r = new self(T, ...V);
      if (!r.parse(P, E, ...args))
        return void 0;
      return r;
    };
  }

  /**
   * @param {Token} [token] 
   */
  constructor(token) {
    /** 
     * Complete initial token with context. Errors of the node will use this
     * token as context.
     */
    this.ctx = token || void 0;
  }

  /**
   * Triggers an error.
   * @param {SimpleCompileExceptionBuilder} e - Exception builder.
   * @param {Token} [token] - Override the default token.
   * @param {...any} args - Other arguments.
   */
  error(e, token, ...args) {
    throw e.from(token ? token : this.ctx, ...args);
  }

  /**
   * Relocate the node to a new context.
   * @param {Token} token 
   */
  relocate(token) {
    this.ctx = token;
  }

  /**
   * Parse the node from the Parser, with panic mode.
   * @param {CompilerParser} P - Parser.
   * @param {Env} E - Symbol table.
   * @param {...any} args - Other arguments.
   * @returns {boolean}
   */
  parse(P, E, ...args) {
    try {
      this.syntax(P, E, ...args);
      return true;
    } catch (e) {
      P.onerror(e);
      return false;
    }
  }

  /**
   * Parse the node from the Parser.
   * @param {CompilerParser} P - Parser.
   * @param {Env} E - Symbol table.
   */
  syntax(P, E) {
    ;
  }

  /**
   * Do the semantic computation.
   */
  semantic(P, E) {
    ;
  }

  /**
   * Default toString().
   * @returns {string}
   */
  toString() {
    return this.ctx ? this.ctx.raw() : "";
  }
}

module.exports = {
  AstNode
};
