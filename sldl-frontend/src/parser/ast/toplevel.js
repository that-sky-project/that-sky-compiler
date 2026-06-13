const { kTokenReserved, kTokenType } = require("../../lexer/token.js");
const { EnvEntry, kEnvEntryType } = require("../env.js");
const { AstNode } = require("./astNode.js");
const { ClassStatement } = require("./statement/classStatement.js");
const { StructStatement } = require("./statement/structStatement.js");
const { EnumStatement } = require("./statement/enumStatement.js");
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
      // ---- enum ----
      if (P.test(kTokenReserved.Enum)) {
        EnumStatement.parse(P, E)(P.look);
      }
      // ---- class ----
      else if (P.test(kTokenReserved.Class)) {
        ClassStatement.parse(P, E)(P.look);
      }
      // ---- struct ----
      else if (P.test(kTokenReserved.Struct)) {
        StructStatement.parse(P, E)(P.look);
      }
      // ---- declare ----
      else if (P.test(kTokenReserved.Declare)) {
        P.move();  // skip "declare"

        if (P.test(kTokenReserved.Class)) {
          // declare class Name;
          ClassStatement.parse(P, E, true)(P.look);
        } else if (TypeRefNode.maybe(P, E)) {
          // declare TypeName varName;
          VariableStatement.parse(P, E, true)(P.look);
        } else {
          P.onerror(new Error("unexpected " + (P.look ? P.look.raw() : "EOF")));
          P.move();
          P.moveTil(kTokenReserved.Semicolon);
        }
      }
      // ---- type-name start: object/variable declaration ----
      else if (TypeRefNode.maybe(P, E)) {
        VariableStatement.parse(P, E)(P.look);
      }
      // ---- skip empty statements ----
      else if (P.test(kTokenReserved.Semicolon)) {
        P.move();
      }
      // ---- unexpected ----
      else {
        P.onerror(new Error("unexpected " + (P.look ? P.look.raw() : "EOF")));
        // Skip to the next safe recovery point, always advancing at
        // least one token to avoid looping on the same token.
        P.move();
        P.moveTil(
          kTokenReserved.Semicolon,
          kTokenReserved.Class,
          kTokenReserved.Struct,
          kTokenReserved.Enum,
          kTokenReserved.Declare,
          kTokenReserved.BraceR
        );
      }
    }
  }
}

module.exports = {
  ToplevelNode
};
