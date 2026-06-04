const { kTokenReserved } = require("../../lexer/token.js");
const { EnvEntry, kEnvEntryType } = require("../env.js");
const { AstNode } = require("./astNode.js");
const { ClassStatement } = require("./statement/classStatement.js");
const { StructStatement } = require("./statement/structStatement.js");
const { VariableStatement } = require("./statement/variableStatement.js");
const { TypeRefNode, TypeDeclaration } = require("./typedecl.js");

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
      if (P.test(kTokenReserved.Class)) {
        var clazz = new ClassStatement(P.look);
        clazz.parse(P, E);
      } else if (P.test(kTokenReserved.Struct)) {
        var strukt = new StructStatement(P.look);
        strukt.parse(P, E);
      } else if (TypeRefNode.maybe(P, E)) {
        var typedef = E.get(P.look);

        if (typedef && typedef.isType() && !typedef.isPrimitive()) {
          // Struct / class type - object constant declaration.
          var stmt = new VariableStatement(P.look);
          stmt.parse(P, E);
        } else {
          // Primitive type - regular variable declaration.
          // <VariableDeclaration>:
          //   <TypeSpecifier> <Declarator> (, <Declarator>)* ;
          for (;;) {
            var typeDecl = TypeDeclaration.parse(P, E)(P.look);
            if (!typeDecl || !typeDecl.name)
              break;

            var entry = new EnvEntry(
              kEnvEntryType.Variable,
              typeDecl.name.content,
              typeDecl
            );
            E.put(entry);

            if (!P.test(kTokenReserved.Comma))
              break;
            P.move();
          }

          // ";"
          P.match(kTokenReserved.Semicolon);
          P.move();
        }
      } else if (P.test(kTokenReserved.Semicolon))
        P.move();
      else
        throw new Error("unexpected " + P.content);
    }
  }
}

module.exports = {
  ToplevelNode
};
