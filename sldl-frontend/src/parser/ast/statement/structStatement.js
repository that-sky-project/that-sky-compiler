const { kBulitInExceptions } = require("../../../exceptions.js");
const { kTokenReserved, kTokenType } = require("../../../lexer/token.js");
const { EnvEntry, kEnvEntryType } = require("../../env.js");
const { AstNode } = require("../astNode.js");
const { Statement } = require("./statement.js");
const { Constant } = require("../expression/constant.js");
const { TypeDeclaration } = require("../typedecl.js");
const { TypeRef } = require("../../type.js");

/** Represents a member variable of a struct. */
class StructMemberDecl extends AstNode {
  constructor() {
    super();

    this.typedef = void 0;
    this.id = void 0;
    this.defaultVal = void 0;
  }

  /**
   * @param {CompilerParser} P - Parser.
   * @param {Env} E - Symbol table.
   * @param {StructStatement} struct - Struct statement.
   */
  panic(P, E, struct) {
    // Panic til ";" or "}"
    P.moveTil(kTokenReserved.Semicolon, kTokenReserved.BraceR);
    if (P.test(kTokenReserved.Semicolon))
      // Prepare for the next member.
      P.move();
  }

  /**
   * Parse a struct member declaration.
   *
   * <StructMember>:
   *   <TypeDeclaration> ;
   *   <TypeDeclaration> = <Literal> ;
   *
   * Entry: look -> <Identifier> for type name.
   * Exit: look -> After ";"
   *
   * @param {CompilerParser} P - Parser.
   * @param {Env} E - Symbol table.
   * @param {StructStatement} struct - Struct statement.
   */
  syntax(P, E, struct) {
    var typeDecl = TypeDeclaration.parse(P, E)(P.look);

    if (!typeDecl || !typeDecl.name)
      this.error(kBulitInExceptions.InvalidType, P.look);

    this.typedef = typeDecl.typedef;
    this.id = typeDecl.name;
    this.relocate(this.id);

    if (P.test(kTokenReserved.Assign)) {
      // Default value.
      P.move();
      this.defaultVal = Constant.parse(P, E)(P.look);
    }

    // ";"
    P.match(kTokenReserved.Semicolon);
    P.move();

    // Struct members must have a primitive or struct base type.
    // Classes and pointers are not allowed in struct members.
    var base = this.typedef;
    while (base && base.child)
      base = base.child;
    if (!(base instanceof TypeRef))
      this.error(kBulitInExceptions.StructInvalidMemberType, this.id);
    else if (base.ref.type === kEnvEntryType.Class)
      this.error(kBulitInExceptions.StructInvalidMemberType, this.id);
  }

  /**
   * Get the name in a string.
   * @returns {string}
   */
  getName() {
    return this.id.raw();
  }
}

/** Represents the member declaration block of a struct. */
class StructBlock extends AstNode {
  /**
   * @param {Token} token - Token "{"
   */
  constructor(token) {
    super(token);
  }

  /**
   * @param {CompilerParser} P - Parser.
   * @param {Env} E - Symbol table.
   * @param {StructStatement} struct - Struct statement.
   */
  panic(P, E, struct) {
    // Panic til "}"
    P.moveTil(kTokenReserved.BraceR);
    P.move();
  }

  /**
   * Parse a struct block.
   *
   * <StructBlock>:
   *   { <StructMembers> }
   *
   * <StructMembers>:
   *   <StructMember> <StructMembers>
   *   <StructMember>
   *
   * Entry: look -> at "{"
   * Exit: look -> after "}"
   *
   * @param {CompilerParser} P - Parser.
   * @param {Env} E - Symbol table.
   * @param {StructStatement} struct - Struct statement.
   */
  syntax(P, E, struct) {
    // "{"
    P.match(kTokenReserved.BraceL);
    P.move();

    while (
      P.test(kTokenType.Identifier)
      && !P.test(kTokenReserved.Class)
      && !P.test(kTokenReserved.Struct)
      && !P.test(kTokenReserved.Enum)
    ) {
      var decl = StructMemberDecl.parse(P, E, struct)();
      if (decl)
        // Add member to struct.
        struct.addMember(decl);
    }

    // "}"
    P.match(kTokenReserved.BraceR);
    P.move();
  }
}

/** Represents a struct. */
class StructStatement extends Statement {
  /**
   * @param {Token} token - The token "struct".
   */
  constructor(token) {
    super(token);

    // - Ast subnodes.

    /** @type {Token} */
    this.name = void 0;
    /** @type {Map<string,StructMemberDecl>} */
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
    // Panic til "}" or ";"
    P.moveTil(kTokenReserved.BraceR, kTokenReserved.Semicolon);
    if (P.test(kTokenReserved.BraceR))
      P.move();
    else if (P.test(kTokenReserved.Semicolon))
      P.move();
  }

  /**
   * Parse a struct declaration.
   *
   * <StructStatement>:
   *   struct <Identifier> <StructBlock> [;]
   *
   * Entry: look -> at "struct"
   * Exit: look -> after <StructBlock>
   *
   * @param {CompilerParser} P - Parser.
   * @param {Env} E - Symbol table.
   */
  syntax(P, E) {
    // Skip "struct".
    var start = P.look;

    P.move();
    P.match(kTokenType.Identifier);

    // Record struct name.
    this.name = P.look;
    if (E.get(this.name))
      throw kBulitInExceptions.MultipleDefinition.from(this.name);

    // Skip struct name.
    P.move();

    StructBlock.parse(P, E, this)(P.look);

    // Optional ";"
    if (P.test(kTokenReserved.Semicolon))
      P.move();

    var entry = EnvEntry.createStruct(this.name, this);
    this.entry = entry;
    E.put(entry);
  }

  /**
   * @param {StructMemberDecl} member
   */
  addMember(member) {
    var name = member.getName();
    if (this.members.has(name))
      throw kBulitInExceptions.DuplicatedMember.from(member.id);

    this.members.set(name, member);
  }

  toString() {
    return "struct " + this.name.raw();
  }
}

module.exports = {
  StructMemberDecl,
  StructStatement
};
