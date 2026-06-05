const { Statement } = require("../statement/statement.js");

class Expression extends Statement {
  /**
   * @param {Token} [token] 
   * @param {Typedef} [type] 
   */
  constructor(token, type) {
    super(token);

    /** @type {Typedef} */
    this.type = type || void 0;
  }

  /**
   * Reassign the type for the expression node.
   * @param {Typedef} type 
   */
  retype(type) {
    this.type = type;
  }
}

module.exports = {
  Expression
};
