/**
 * HLCL Compiler Frontend
 *
 * for CBLDL v2.0
 *
 * Copyright (c) 2025 HTMonkeyG
 *
 * MIT License
 */

const { CompilerLexer } = require("./src/lexer/lexer.js");

/**
 * Tokenize a preprocessed FileSlice into a stream of Token objects.
 *
 * @param {FileSlice} fileSlice - Preprocessed input (directives resolved,
 *   macros expanded, conditionals evaluated).
 * @returns {{ tokens: Token[], lexer: CompilerLexer }}
 */
function tokenize(fileSlice) {
  var lexer = new CompilerLexer(fileSlice)
    , tokens = []
    , t;

  while ((t = lexer.scan()) != null)
    tokens.push(t);

  return {
    tokens: tokens,
    lexer: lexer
  }
}

module.exports = {
  tokenize: tokenize,
  CompilerLexer: CompilerLexer
};
