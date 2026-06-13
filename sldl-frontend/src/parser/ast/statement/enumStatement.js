const { kBulitInExceptions } = require("../../../exceptions.js");
const { kTokenReserved, kTokenType, kInternalTypes } = require("../../../lexer/token.js");
const { EnvEntry, kEnvEntryType } = require("../../env.js");
const { AstNode } = require("../astNode.js");
const { Statement } = require("./statement.js");
const { Constant } = require("../expression/constant.js");
const { checkInitMember, isIntegerConstant } = require("../../checker.js");

/** Represents a single enum member constant. */
class EnumMember extends AstNode {
  constructor() {
    super();

    /** @type {Token} */
    this.id = void 0;
    /** @type {Constant} The constant value expression. */
    this.valueExpr = void 0;
    /** @type {EnvEntry} The constant entry in symbol table. */
    this.entry = void 0;
  }

  /**
   * Parse an enum member.
   *
   * <EnumMember>:
   *   <Identifier> = <Constant>
   *
   * Entry: look -> <Identifier> for constant name.
   * Exit: look -> after <Constant> (before "," or "}").
   *
   * @param {CompilerParser} P - Parser.
   * @param {Env} E - Symbol table.
   * @param {EnumStatement} stmt - Enum statement.
   */
  syntax(P, E, stmt) {
    // Constant name.
    P.match(kTokenType.Identifier);
    this.id = P.look;
    this.relocate(this.id);

    if (E.get(this.id))
      throw kBulitInExceptions.MultipleDefinition.from(this.id);

    // Skip name.
    P.move();

    // "="
    P.match(kTokenReserved.Assign);
    P.move();

    // Parse the value — must be a constant expression.
    if (P.test(kTokenType.Number)) {
      this.valueExpr = Constant.parse(P, E)(P.look);
    } else if (P.test(kTokenReserved.Sub)) {
      // Negative integer constant.
      P.move();
      if (P.test(kTokenType.Number)) {
        var negConst = Constant.parse(P, E)(P.look);
        if (negConst)
          // Store value directly — the Constant already has a
          // negative value from the lexer.
          this.valueExpr = negConst;
      } else {
        this.error(kBulitInExceptions.Unexpected, P.look);
      }
    } else {
      this.error(kBulitInExceptions.Unexpected, P.look);
    }

    if (!isIntegerConstant(this.valueExpr))
      this.error(kBulitInExceptions.InvalidType, this.id);

    // Register in Env.
    var entry = EnvEntry.createConstant(
      this.id,
      this,
      stmt.entry,
      this.valueExpr
    );
    this.entry = entry;
    E.put(entry);
  }

  /**
   * Get the name in a string.
   * @returns {string}
   */
  getName() {
    return this.id.raw();
  }
}

/** Represents the member block of an enum. */
class EnumBlock extends AstNode {
  /**
   * @param {Token} token - Token "{"
   */
  constructor(token) {
    super(token);
  }

  /**
   * @param {CompilerParser} P - Parser.
   * @param {Env} E - Symbol table.
   * @param {EnumStatement} stmt - Enum statement.
   */
  panic(P, E, stmt) {
    // Panic til "}"
    P.moveTil(kTokenReserved.BraceR);
    P.move();
  }

  /**
   * Parse an enum block.
   *
   * <EnumBlock>:
   *   { <EnumMembers> }
   *
   * <EnumMembers>:
   *   <EnumMember>
   *   <EnumMember> , <EnumMembers>
   *
   * Entry: look -> at "{"
   * Exit: look -> after "}"
   *
   * @param {CompilerParser} P - Parser.
   * @param {Env} E - Symbol table.
   * @param {EnumStatement} stmt - Enum statement.
   */
  syntax(P, E, stmt) {
    // "{"
    P.match(kTokenReserved.BraceL);
    P.move();

    // Empty enum body is allowed (though unusual).
    if (P.test(kTokenReserved.BraceR)) {
      P.move();
      return;
    }

    while (P.test(kTokenType.Identifier)) {
      var decl = EnumMember.parse(P, E, stmt)();
      if (decl)
        stmt.addMember(decl);

      // ","
      if (!P.test(kTokenReserved.Comma))
        break;

      P.move();
      if (P.test(kTokenReserved.BraceR))
        // Allow trailing comma before "}".
        break;
    }

    // "}"
    P.match(kTokenReserved.BraceR);
    P.move();
  }
}

/** Represents an enum declaration. */
class EnumStatement extends Statement {
  /**
   * @param {Token} token - The token "enum".
   */
  constructor(token) {
    super(token);

    // - Ast subnodes.

    /** @type {Token} */
    this.name = void 0;
    /** @type {Map<string,EnumMember>} */
    this.members = new Map();

    // - Env params.

    /** @type {EnvEntry} */
    this.entry = void 0;
  }

  /**
   * @param {CompilerParser} P - Parser.
   * @param {Env} E - Symbol table.
   */
  panic(P, E) {
    // Panic til "}"
    P.moveTil(kTokenReserved.BraceR, kTokenReserved.Semicolon);
    if (P.test(kTokenReserved.BraceR))
      P.move();
    else if (P.test(kTokenReserved.Semicolon))
      P.move();
  }

  /**
   * Parse an enum declaration.
   *
   * <EnumStatement>:
   *   enum <Identifier> <EnumBlock> [;]
   *
   * Entry: at "enum"
   * Exit: after <EnumBlock>
   *
   * @param {CompilerParser} P - Parser.
   * @param {Env} E - Symbol table.
   */
  syntax(P, E) {
    // Skip "enum".
    var start = P.look;

    P.move();
    P.match(kTokenType.Identifier);

    // Record enum name.
    this.name = P.look;
    if (E.get(this.name))
      throw kBulitInExceptions.MultipleDefinition.from(this.name);

    // Skip enum name.
    P.move();

    // Register enum type as a Typedef alias for int32_t.
    var entry = EnvEntry.createTypedef(this.name, this,
      require("../../env.js").kInternalTypeEntries.Int32);
    this.entry = entry;
    E.alias(entry, kInternalTypes.Int32);

    // Parse members.
    EnumBlock.parse(P, E, this)(P.look);

    // Optional ";"
    if (P.test(kTokenReserved.Semicolon))
      P.move();
  }

  /**
   * @param {EnumMember} member
   */
  addMember(member) {
    var name = member.getName();
    if (this.members.has(name))
      throw kBulitInExceptions.DuplicatedMember.from(member.id);

    this.members.set(name, member);
  }

  toString() {
    return "enum " + this.name.raw();
  }
}

module.exports = {
  EnumMember,
  EnumBlock,
  EnumStatement
};
