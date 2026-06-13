const fs = require("fs");
const pl = require("path");
const ps = require("process");
const arg = require("arg");
const { printHelp, printVersion } = require("./src/texts.js");

const argv = arg({
  "--help": Boolean,
  "--version": Boolean,

  "--output": String,
  "-c": Boolean,

  "-o": "--output",
}, {
  permissive: true
});

var inputs = []
  , linkerParams = []
  , includePaths = []
  , libPaths = [];

for (var s of ps.argv.slice(2)) {
  /*if (s.startsWith("-Wl"))
    linkerParams = s.split(",").slice(1);
  else if (s.startsWith("-L"))
    libPaths.push(s.slice(2).trim());
  else if (s.startsWith("-I"))
    includePaths.push(s.slice(2).trim());
  else*/
  inputs.push(s);
}

!async function () {
  if (argv["--help"])
    return printHelp();
  if (argv["--version"])
    return printVersion();
}();