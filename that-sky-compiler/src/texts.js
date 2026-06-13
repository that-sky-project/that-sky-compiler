const { printF } = require("@htmonkeyg/tformat");

const kCompilerVersion = [1, 0, 0];

function printf(format, ...args) {
  printF(format, args);
}

function printHelp() {
  printf("Usage: skycc [options] file...");
  printf("Options:");
  printf("  --help                 Display this help.");
  printf("  --version              Display version information.");
  printf("  -c                     Compile but do not link.");
  printf("  -o <file>              Place the output into <file>.");
}

function printVersion() {
  printf(`skycc v${kCompilerVersion[0]}.${kCompilerVersion[1]}.${kCompilerVersion[2]}`);
  printf("A simple compiler and converter for Sky:CotL level format.");
  printf("Copyright (C) 2026 That Sky Project");
  printf("<https://www.github.com/that-sky-project/that-sky-compiler>");
  printf("This is free software; see the source for copying conditions.  There is NO");
  printf("warranty; not even for MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.");
}

module.exports = {
  kCompilerVersion,
  printf,
  printHelp,
  printVersion
};
