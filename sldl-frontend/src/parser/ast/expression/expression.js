const { Statement } = require("../statement/statement.js");

class Expression extends Statement {
  /**
   * @param {Token} [token] 
   * @param {EnvEntry} [type] 
   */
  constructor(token, type) {
    super(token);

    this.type = type || void 0;
  }

  /**
   * Reassign the type for the expression node.
   * @param {EnvEntry} type 
   */
  retype(type) {
    this.type = type;
  }
}

module.exports = {
  Expression
};
