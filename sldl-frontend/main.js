/**
 * SLDL Compiler (sldl-cc)
 * for SLDL v1.0.0
 *
 * Compiles SLDL source text into an Env symbol table compatible with
 * sldl-frontend format.
 *
 * Copyright (c) 2026 That Sky Project
 * LGPL-3.0-or-later
 */

const { CompilerParser } = require("./src/parser/parser.js");
const { ToplevelNode } = require("./src/parser/ast/toplevel.js");

/**
 * Compile SLDL source text into an Env symbol table.
 *
 * @param {FileSlice|string} input - SLDL source (preprocessed).
 * @returns {{env: Env, errors: Error[], parser: CompilerParser}}
 */
function compile(input) {
  var parser = new CompilerParser(input);
  ToplevelNode.parse(parser, parser.env)();
  return {
    env: parser.env,
    errors: parser.errors,
    parser: parser
  };
}

module.exports = {
  compile
};
