/**
 * Simple expression type checker and static evaluator.
 *
 * Provides type compatibility checking and compile-time constant folding
 * for SLDL expressions used in initializers, enum values, and array sizes.
 *
 * Copyright (c) 2026 That Sky Project
 * LGPL-3.0-or-later
 */

const { Typedef, TypeRef, PointerTo, ArrayOf } = require("./type.js");
const { kTokenType } = require("../lexer/token.js");

/**
 * Check if two types are compatible (structurally equal).
 * @param {Typedef} expected
 * @param {Typedef} actual
 * @returns {boolean}
 */
function checkType(expected, actual) {
  return Typedef.equal(expected, actual);
}

/**
 * Check if an initializer value is compatible with the declared member type.
 *
 * Resolves the member's typedef from the type entry's node.members map,
 * then checks that the value expression's type is compatible.
 *
 * @param {EnvEntry} typeEntry    - Target struct/class type entry.
 * @param {string} memberName     - Member name string.
 * @param {AstNode} value         - The value expression.
 * @returns {boolean}             - True if compatible.
 */
function checkInitMember(typeEntry, memberName, value) {
  if (!typeEntry || !typeEntry.node || !typeEntry.node.members)
    return true;  // No type info available, allow.

  var memberDecl = typeEntry.node.members.get(memberName);
  if (!memberDecl || !memberDecl.typedef)
    return true;  // Unknown member, allow (parser will catch elsewhere).

  var expectedType = memberDecl.typedef;
  var actualType = resolveType(value);

  if (!actualType)
    return true;  // Can't determine type, allow.

  return checkType(expectedType, actualType);
}

/**
 * Resolve the type of an expression node.
 * Returns a Typedef or null if unknown.
 *
 * @param {AstNode} node
 * @returns {Typedef|null}
 */
function resolveType(node) {
  if (!node)
    return null;

  // Constant literals carry their own type.
  if (node.type instanceof Typedef)
    return node.type;

  // Reference: get type from EnvEntry.
  if (node.type && node.type.vartype) {
    var vartype = node.type.vartype;
    if (vartype instanceof Typedef)
      return vartype;
    // vartype is an EnvEntry, wrap in TypeRef.
    return new TypeRef(vartype);
  }

  // InitList or ArrayInit — no direct type.
  return null;
}

/**
 * Evaluate a constant expression at compile time.
 * Returns the AST node itself if it's already a Constant, or a new Constant
 * if folding was possible. Returns null if not constant.
 *
 * @param {AstNode} node
 * @returns {AstNode|null}
 */
function staticFold(node) {
  if (!node)
    return null;

  // Already a Constant.
  var { Constant } = require("./ast/expression/constant.js");
  if (node instanceof Constant)
    return node;

  // Unary expression with constant operand.
  var { UnaryExpression } = require("./ast/expression/unaryExpression.js");
  if (node instanceof UnaryExpression) {
    return null;  // Can't create a new token for folded constant.
  }

  return null;
}

/**
 * Check if a node represents an integer constant value.
 * Used for enum values and array size expressions.
 *
 * @param {AstNode} node
 * @returns {boolean}
 */
function isIntegerConstant(node) {
  if (!node)
    return false;

  var { Constant } = require("./ast/expression/constant.js");
  if (node instanceof Constant) {
    var v = node.getValue();
    return typeof v === "number" && Number.isInteger(v);
  }

  return false;
}

/**
 * Get the integer value from a constant node.
 * Returns the value or throws if not an integer constant.
 *
 * @param {AstNode} node
 * @returns {number}
 */
function getIntegerValue(node) {
  if (!isIntegerConstant(node))
    throw new Error("expected integer constant");
  return node.getValue();
}

/**
 * Check if a node is compatible with a target type entry.
 * Walks the type chain to the leaf TypeRef and compares EnvEntries.
 *
 * @param {Typedef} type
 * @param {EnvEntry} targetEntry
 * @returns {boolean}
 */
function typeMatchesEntry(type, targetEntry) {
  if (!type || !targetEntry)
    return false;
  var leaf = Typedef.leaf(type);
  if (leaf instanceof TypeRef)
    return leaf.ref === targetEntry;
  return false;
}

module.exports = {
  checkType,
  checkInitMember,
  resolveType,
  staticFold,
  isIntegerConstant,
  getIntegerValue,
  typeMatchesEntry
};
