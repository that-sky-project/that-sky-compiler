const { kTokenReserved, kTokenType } = require("../../lexer/token.js");
const { EnvEntry, kEnvEntryType } = require("../env.js");
const { AstNode } = require("./astNode.js");
const { ClassStatement } = require("./statement/classStatement.js");
const { StructStatement } = require("./statement/structStatement.js");
const { VariableStatement } = require("./statement/variableStatement.js");
const { TypeRefNode, TypeDeclaration } = require("./typedecl.js");
const { InitList } = require("./initList.js");
const { ArrayInit } = require("./arrayInit.js");
const { Constant } = require("./expression/constant.js");

class ToplevelNode extends AstNode {
  constructor() {
    super();

    this.child = void 0;
  }

  /**
   * Parse a toplevel program.
   * @param {CompilerParser} P - Parser.
   * @param {Env} E - Symbol table.
   */
  syntax(P, E) {
    while (!P.done) {
      if (P.test(kTokenReserved.Class))
        var clazz = ClassStatement.parse(P, E)(P.look);
      else if (P.test(kTokenReserved.Struct)) {
        var strukt = StructStatement.parse(P, E)(P.look);
      } else if (TypeRefNode.maybe(P, E)) {
        var typedef = E.get(P.look);
        var stmt = VariableStatement.parse(P, E)(P.look);
      } else if (P.test(kTokenReserved.Semicolon))
        P.move();
      else {
        P.onerror(new Error("unexpected " + (P.look ? P.look.raw() : "EOF")));
        // Skip to the next safe recovery point, always advancing at
        // least one token to avoid looping on the same token.
        P.move();
        P.moveTil(
          kTokenReserved.Semicolon,
          kTokenReserved.Class,
          kTokenReserved.Struct,
          kTokenReserved.BraceR
        );
      }
    }
  }
}

module.exports = {
  ToplevelNode
};
