const { kMetaTypes, kMetaValueType, MetaTypeStruct, MetaTypeClass, MetaTypePointer } = require("sldl-objects");
const { kItaniumException } = require("./exception.js");

class StringReader {
  constructor(s) {
    this.string = s;
    this.arr = Array.from(s);
    this.cursor = 0;
  }

  get pos() {
    return this.cursor;
  }

  get ch() {
    return this.arr[this.cursor];
  }

  read() {
    return this.arr[this.cursor++];
  }

  done() {
    return this.cursor >= this.arr.length;
  }

  isNumber() {
    return /\d/.test(this.ch);
  }

  skipSeparator() {
    while (this.ch == '_')
      this.read();
  }

  readInteger() {
    this.skipSeparator();
    if (!this.isNumber())
      return void 0;

    var r = 0;
    while (this.isNumber()) {
      r *= 10;
      r += Number(this.read());
    }

    return r;
  }

  readString(length) {
    this.skipSeparator();
    var r = "";
    while (length) {
      r += this.read();
      length--;
    }
    return r;
  }
}

const kItaniumTypes = Object.freeze({
  b: kMetaTypes.Bool,
  c: kMetaTypes.Int8,
  h: kMetaTypes.Uint8,
  s: kMetaTypes.Int16,
  t: kMetaTypes.Uint16,
  i: kMetaTypes.Int32,
  j: kMetaTypes.Uint32,
  x: kMetaTypes.Int64,
  y: kMetaTypes.Uint64,
  f: kMetaTypes.Float,
  d: kMetaTypes.Double,
  g: kMetaTypes.TgcString
});

class ItaniumResolver {
  static resolve(s) {
    var r = new ItaniumResolver(s);
    r.resolve();
    if (r.pending.size)
      return void 0;
    return [...r.names.values()];
  };

  constructor(s) {
    this.reader = new StringReader(s);
    /** @type {Map<string, {clazz:MetaTypeClass,name:string,count:number,isPointer:boolean}>} */
    this.pending = new Map();
    /** @type {Map<string, MetaType>} */
    this.names = new Map();
  }

  err() {
    throw kItaniumException.Unexpected.from(this.reader.ch, this.reader.cursor);
  }

  /**
   * @param {string} type 
   * @param {MetaTypeClass} clazz 
   * @param {string} name 
   * @param {number} count 
   * @param {boolean} isPointer 
   */
  record(type, clazz, name, count, isPointer) {
    this.pending.has(type) || this.pending.set(type, []);
    this.pending.get(type).push({ clazz, name, count, isPointer });
  }

  /**
   * @param {MetaType} type 
   */
  backpatch(type) {
    var a = this.pending.get(type.getName());
    a && a.forEach(function (t) {
      // No struct pointer or struct pointer array.
      if (type.valueType() != kMetaValueType.Class && isPointer)
        throw kItaniumException.InvalidPointer.from(type.getName());
      t.clazz.addMember(type, t.name, t.count == -1 ? void 0 : t.count);
    });
    this.pending.delete(type.getName());
  }

  resolve() {
    while (!this.reader.done()) {
      var seg;
      if (this.reader.ch === 'U') {
        // Parse struct declaration.
        this.reader.read();
        seg = this.resolveStruct();
      } else if (this.reader.ch === 'C') {
        // Parse class declaration.
        this.reader.read();
        seg = this.resolveClass();
      } else
        this.err();

      if (this.reader.read() !== 'E')
        // Parse end mark.
        this.err();

      if (this.names.has(seg.getName()))
        throw new Error("duplicated declaration: " + seg.getName());

      // Save the result.
      this.names.set(seg.getName(), seg);
      this.backpatch(seg);
    }
  }

  resolveClass() {
    var name = this.lengthString()
      , align = 0;

    if (this.reader.read() !== 'T')
      // Parse member list start mark.
      this.err();

    var result = new MetaTypeClass(name);
    while (!this.reader.done() && this.reader.ch !== 'E')
      // Parse member list.
      this.resolveClassMember(result);

    // Parse end mark.
    if (this.reader.read() !== 'E')
      this.err();

    return result;
  }

  resolveClassMember(clazz) {
    var name = this.lengthString()
      , count = -1
      , isPointer = false
      , type = null;

    if (this.reader.ch === 'A') {
      this.reader.read();
      // Parse array type.
      if (!this.reader.isNumber())
        count = 0;
      else
        count = this.reader.readInteger();
      this.reader.skipSeparator();
    }

    if (this.reader.ch === 'P') {
      isPointer = true;
      this.reader.read();
    }

    var typeId;
    if (this.reader.isNumber()) {
      // Parse struct type.
      typeId = this.lengthString();
      if (!this.names.has(typeId))
        this.record(typeId, clazz, name, count, isPointer);
      else
        type = this.names.get(typeId);
    } else {
      // Parse primitive type.
      typeId = this.reader.read();
      type = kItaniumTypes[typeId];
      if (!type)
        this.err();
    }

    if (type) {
      // Don't add member if needs backpatch.
      if (type.valueType() != kMetaValueType.Class && isPointer)
        // No struct pointer or struct pointer array.
        throw kItaniumException.InvalidPointer.from(type.getName());

      if (isPointer)
        // TODO: Add type verification for the pointer.
        type = kMetaTypes.Pointer;

      clazz.addMember(type, name, count == -1 ? void 0 : count);
    }
  }

  resolveStruct() {
    var name = this.lengthString()
      , align = 0;

    if (this.reader.ch === 'L') {
      // Parse alignment.
      this.reader.read();
      align = this.reader.readInteger();
      if (!align)
        this.err();
    } else if (reader.ch !== 'T')
      // Parse member list start mark.
      this.err();

    var result = new MetaTypeStruct(name);
    this.reader.read();

    while (!this.reader.done() && this.reader.ch !== 'E')
      // Parse member list.
      this.resolveStructMember(result);

    if (this.reader.done())
      this.err();

    if (align && !result.finalize(align))
      throw kItaniumException.InvalidAlign.from(align);

    // Parse end mark.
    if (this.reader.read() !== 'E')
      this.err();

    return result;
  }

  /**
   * @param {MetaTypeStruct} struct 
   */
  resolveStructMember(struct) {
    var name = this.lengthString()
      , count = 0
      , type;

    if (this.reader.ch === 'A') {
      this.reader.read();
      // Parse array type.
      if (!this.reader.isNumber())
        this.err();

      count = this.reader.readInteger();
      this.reader.skipSeparator();
    }

    var typeId;
    if (this.reader.isNumber()) {
      // Parse struct type.
      typeId = this.lengthString();
      if (!this.names.has(typeId))
        this.err();
      type = this.names.get(typeId);
    } else {
      // Parse primitive type.
      typeId = this.reader.read();
      type = kItaniumTypes[typeId];
      if (!type)
        this.err();
    }

    struct.addMember(type, name, count);
  }

  /** @returns {string} */
  lengthString() {
    var l = this.reader.readInteger();
    if (!l)
      this.err();

    var s = this.reader.readString(l);
    if (s === "")
      this.err();

    return s;
  }
}

module.exports = {
  ItaniumResolver,
  kItaniumTypes
};
