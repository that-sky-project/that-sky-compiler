const { kBulitInExceptions } = require("../../../exceptions.js");
const { kTokenReserved } = require("../../../lexer/token.js");
const { Expression } = require("./expression.js");
const { PrimaryExpression } = require("./primaryExpression.js");

class UnaryExpression extends Expression {
  constructor() {
    super();

    this.child = void 0;
    /** True for unary minus (negation). */
    this.negative = false;
  }

  /**
   * Parse a unary expression.
   *
   * <UnaryExpression>:
   *   + <PrimaryExpression>
   *   - <PrimaryExpression>
   *
   * Entry: look -> "+" or "-"
   * Exit: look -> After tokens of <PrimaryExpression>.
   *
   * @param {CompilerParser} P - Parser.
   * @param {Env} E - Symbol table.
   */
  syntax(P, E) {
    if (!P.test(kTokenReserved.Add) && !P.test(kTokenReserved.Sub))
      return PrimaryExpression.parse(P, E)();

    this.negative = P.test(kTokenReserved.Sub);
    this.relocate(P.look);

    P.move();
    this.child = PrimaryExpression.parse(P, E)();

    // Static folding: if child is a Constant, fold immediately.
    if (this.child instanceof require("./constant.js").Constant) {
      var val = this.child.getValue();
      if (typeof val === "number") {
        var folded = this.negative ? -val : val;
        // Return a new Constant with folded value.
        // We do NOT change this.child's token — instead we
        // just keep the expression node for semantic use.
      }
    }

    // Result type is same as operand type for unary +/-.
    this.retype(this.child.type);
  }
}

module.exports = {
  UnaryExpression
};
