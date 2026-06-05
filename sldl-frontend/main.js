/**
 * SLDL Compiler Frontend
 * for SLDL v1.0.0
 * 
 * Copyright (c) 2026 That Sky Project
 * LGPL-3.0-or-later
 */

const { CompilerLexer } = require("./src/lexer/lexer.js");
const { CompilerParser } = require("./src/parser/parser.js");

/**
 * Tokenize a preprocessed FileSlice into a stream of Token objects.
 *
 * @param {FileSlice|string} input - Preprocessed input.
 * @returns {{tokens: Token[], lexer: CompilerLexer}}
 */
function tokenize(input) {
  var lexer = new CompilerLexer(input)
    , tokens = []
    , t;

  while ((t = lexer.scan()) != null)
    tokens.push(t);

  return {
    tokens,
    lexer
  };
}

/**
 * Parse a token array into an AST.
 *
 * @param {FileSlice|string} input - Preprocessed input.
 * @returns {{parser: CompilerParser}} Program AST.
 */
function parse(input) {
  var parser = new CompilerParser(tokens);
  return {
    parser
  }
}

module.exports = {
  // Helper functions.
  tokenize,
  parse,
};
