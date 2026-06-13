const { kBulitInExceptions } = require("../../../exceptions.js");
const { kTokenReserved, kTokenType } = require("../../../lexer/token.js");
const { EnvEntry, kEnvEntryType } = require("../../env.js");
const { AstNode } = require("../astNode.js");
const { Statement } = require("./statement.js");
const { Reference } = require("../expression/reference.js");
const { InitList } = require("../initList.js");
const { TypeDeclaration } = require("../typedecl.js");

/** Represents a variable / object declaration. */
class VariableStatement extends Statement {
  /**
   * @param {Token} token - The type-name token.
   */
  constructor(token) {
    super(token);

    /** @type {AstNode} The type declaration. */
    this.typedecl = void 0;
    /** @type {Token} The variable name. */
    this.name = void 0;
    /** @type {InitList} The initializer. */
    this.init = void 0;
    /** True when declared via "declare" keyword (forward reference). */
    this.isDeclare = false;
  }

  /**
   * @param {CompilerParser} P - Parser.
   * @param {Env} E - Symbol table.
   */
  panic(P, E) {
    // Panic til ";"
    P.moveTil(kTokenReserved.Semicolon);
    P.move();
  }

  /**
   * Parse an object constant declaration.
   *
   * <VariableStatement>:
   *   <TypeDeclaration> ;
   *   <TypeDeclaration> = <InitList> ;
   *
   * With declare:
   *   declare <TypeDeclaration> ;
   *
   * Entry: look -> <TypeDeclaration> for type name.
   * Exit: look -> after ";"
   *
   * @param {CompilerParser} P - Parser.
   * @param {Env} E - Symbol table.
   * @param {boolean} [isDeclare] - True if preceded by "declare".
   */
  syntax(P, E, isDeclare) {
    this.isDeclare = !!isDeclare;
    this.typedecl = TypeDeclaration.parse(P, E)();
    this.name = this.typedecl.name;
    this.relocate(this.name);

    if (!P.test(kTokenReserved.Semicolon)) {
      // "="
      P.match(kTokenReserved.Assign);
      P.move();

      // <InitList> - pass type entry for member validation.
      var typeEntry = this.typedecl.baseType
        ? this.typedecl.baseType.def
        : void 0;
      this.init = InitList.parse(P, E, typeEntry)(P.look);
    }

    // ";"
    P.match(kTokenReserved.Semicolon);
    P.move();

    // Register as a variable in the symbol table.
    var existing = E.get(this.name);
    if (existing) {
      // Allow re-definition if the existing entry was a forward declaration
      // (from "declare") with no init value, and this one provides the init.
      if (existing.type === kEnvEntryType.Variable && !existing.value && this.init) {
        existing.setValue(this.init);
        existing.node = this;
        return;
      }
      this.error(kBulitInExceptions.MultipleDefinition, this.name);
    }

    E.put(EnvEntry.createVariable(this.name, this, this.typedecl.typedef, this.init));
  }
}

module.exports = {
  VariableStatement
};
