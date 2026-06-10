# sldl-jsonify
Read and write sky level with JSON and Itanium-like type declarations.

## Installation
```sh
npm i sldl-jsonify
```

## Type Declarations

|class|First ID Part|Second ID Part|Meaning|
|-|-|-|-|
|type|A||array type|
|obj|A|l|type aliasing|
|type|C||class declaration|
|type|c||built-in type int8_t|
|type|d||built-in type double|
|delim|E||End of argument list|
|type|f||built-in type float|
|type|h||built-in type uint8_t|
|obj|L||Align of the struct|
|type|P||pointer type|
|type|s||built-in type int16_t|
|delim|T||Start of member list|
|type|t||built-in type uint16_t|
|type|i||built-in type int32_t|
|type|j||built-in type uint32_t|
|type|U||struct declaration|
|type|x||built-in type int64_t|
|type|y||built-in type uint64_t|
