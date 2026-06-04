# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

That Sky Compiler — a compiler for the Sky Level Description Language (SLDL). It compiles `.skyc` source files through preprocessing, lexing, and parsing into an AST.

## Monorepo structure (npm workspaces)

| Package | Purpose | Status |
|---|---|---|
| `sldl-utils` | Shared utilities: `FileSlice`, `FileInterface`, exception builders | Stable |
| `sldl-preprocessor` | C-style preprocessor (`#include`, `#define`, `#if`/`#ifdef`/`#ifndef`/`#else`/`#endif`) | Stable |
| `sldl-frontend` | Lexer + recursive-descent parser → AST | Active development |
| `sldl-objects` | Code generation backend | Stub |
| `sldl-linker` | Linker | Not yet created |

## Build / test

```bash
# Run the frontend test (tokenize + parse test.skyc, print tokens, errors, symbol table)
node sldl-frontend/test/main.js

# Quick JS syntax / import check
node -e "require('./sldl-frontend/src/parser/ast/typedecl.js')"
```

There is no build step — the project runs directly on Node.js as CommonJS modules.

## Compilation pipeline

```
Source (.skyc) ──► Preprocessor ──► Tokenizer ──► Parser ──► AST
                      │                 │             │
                 sldl-preprocessor  CompilerLexer  CompilerParser
                                     (lexer.js)    (parser.js)
```

1. **Preprocessor** (`sldl-preprocessor/main.js`): resolves `#include`, expands macros (`#define`/`#undef`), evaluates conditionals (`#if`/`#ifdef`/`#endif`). Outputs a processed `FileSlice`.
2. **Tokenizer** (`sldl-frontend/main.js` `tokenize()`): `CompilerLexer` scans the preprocessed `FileSlice` into a `Token[]` array. Token types: `Number`, `String`, `Identifier` (`Word`), and `Token` (operators/punctuation). Reserved words and built-in type names are pre-registered in `kTokenReserved`.
3. **Parser** (`sldl-frontend/src/parser/parser.js`): `CompilerParser` wraps the lexer with lookahead (`P.look`), `test()`/`match()`/`move()`/`moveTil()` helpers, error collection, and a chained-scope `Env` symbol table pre-populated with primitive types.

## Key architectural patterns

### Static factory parse pattern

Every `AstNode` subclass uses a two-stage parse:
```js
// Static parse returns a factory; call it with a token to get an instance.
var node = SomeNode.parse(parser, env)(parser.look);
```
`AstNode.parse(P, E, ...args)` is the static method — it returns `(Token, ...V) => new self(Token).parse(P, E, ...args)`. The instance `parse()` does try/catch and delegates to `syntax()`. Classes that override `parse` directly (like `TypeDeclarator`) skip the try/catch wrapper — they must return `true` on success.

### Two coexisting type systems

1. **`type.js` — `Typedef` chain**: `TypeRef`, `PointerTo`, `ArrayOf`. A linked list from outermost to innermost modifier. Used by `typedecl.js` (`TypeDeclaration` / `TypeDeclarator`) and class/struct member declarations (`ClassMemberDecl`, `StructMemberDecl`).

2. **`variable.js` — `TypeNode` classes**: `TypeNameNode`, `PointerTypeNode`, `ArrayTypeNode`. A tree structure. Used by `VariableDeclarator` for primitive-type variable declarations (`int a, *b, c[10];`).

The `typedecl.js` system is the newer, preferred approach for type parsing. `variable.js`'s `VariableDeclarator` has a known bug in pointer/array precedence matching the same bug that was fixed in `typedecl.js`.

### Type construction order (critical for correctness)

In C-style declarators, modifiers closer to the type name are INNERMOST, modifiers closer to the variable name are OUTERMOST:
- `int *p[10]` → `ArrayOf(PointerTo(TypeRef(int)), 10)` — array of 10 pointers to int
- `int (*p)[10]` → `PointerTo(ArrayOf(TypeRef(int)), 10)` — pointer to array of 10 ints

For parenthesized declarators, outer array suffixes go INSIDE the inner chain (wrap the leaf). See `TypeDeclarator._wrapLeaf()`.

### Symbol table

`Env` is a chained-scope table (`Env.prev` links to the parent scope). `EnvEntry` records carry a `type` (Primitive/Class/Struct/Variable/Constant/etc.), a `name` (Word), an optional AST `node`, and `parent`/`members`/`value` for type relationships.

### Error handling

- `kBulitInExceptions` (in `sldl-utils/src/exceptions.js`) defines exception builders: `Unexpected`, `InvalidType`, `DuplicatedMember`, `StructInvalidMemberType`, etc.
- `AstNode.error(exceptionBuilder, token)` throws a `CompileException` with source location.
- `CompilerParser.onerror(e)` collects errors (max 1024). The parser continues in panic mode via `moveTil()`.

## Language syntax (SLDL)

Supported constructs:
- **class**: `class Name { <members> }` with optional `extends Parent`. Members: `<type> <name> [= <default>];`.
- **struct**: `struct Name { <members> }`. Members must have primitive base types (including pointers/arrays of primitives).
- **Variable declarations**: `<primitive-type> <declarator> [, <declarator>]* ;` using `VariableDeclarator`.
- **Object constants**: `<class/struct-type> <name> = <InitList> ;` using `VariableStatement`.
- **Initializer lists**: `{ .name = value, ... }` (C-style) or `{ name: value, ... }` (JSON-style).
- **Array initializers**: `[value, value, ...]` (ordered).
- **Preprocessor**: `#include`, `#define`, `#ifdef`/`#ifndef`/`#if`/`#else`/`#endif`.

Built-in types: `bool`, `int8_t`–`int64_t`, `uint8_t`–`uint64_t`, `float`, `double`, `cstring`, `TgcString`, `Object`, `Clump`.

## Code style (from CLAUDE.md.1)

- JavaScript only, 2-space indentation, ASCII only
- `var` preferred over `let`/`const`; group related `var` declarations with comma-first line breaks
- `function` expressions over arrow functions; `class` over prototype
- camelCase for variables/functions, PascalCase for classes, UPPER_SNAKE for constants
- English comments ending with a period; comment + indent + `//` ≤ 80 columns
- No `_` or `#` prefixes on member names
- Single-statement if/else bodies go on a new indented line without braces
- Ternary `?` and `:` go on new lines with one level of indent
