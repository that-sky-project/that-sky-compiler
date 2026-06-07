/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <https://feross.org>
 * @license  MIT
 */

/**
 * The MIT License (MIT)
 *
 * Copyright (c) Feross Aboukhadijeh, and other contributors.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 */

export class Buffer extends Uint8Array {
  length: number

  /** If true, the runtime supports typed arrays. */
  static TYPED_ARRAY_SUPPORT: boolean;
  /** Default pool size (not used by this implementation). */
  static poolSize: number;

  write(string: string, offset?: number, length?: number, encoding?: string): number;
  toString(encoding?: string, start?: number, end?: number): string;
  toLocaleString(encoding?: string, start?: number, end?: number): string;
  toJSON(): { type: 'Buffer', data: any[] };
  equals(otherBuffer: Buffer): boolean;
  compare(otherBuffer: Uint8Array, targetStart?: number, targetEnd?: number, sourceStart?: number, sourceEnd?: number): number;
  copy(targetBuffer: Buffer, targetStart?: number, sourceStart?: number, sourceEnd?: number): number;
  slice(start?: number, end?: number): Buffer;

  writeUIntLE(value: number, offset: number, byteLength: number, noAssert?: boolean): number;
  writeUintLE(value: number, offset: number, byteLength: number, noAssert?: boolean): number;
  writeUIntBE(value: number, offset: number, byteLength: number, noAssert?: boolean): number;
  writeUintBE(value: number, offset: number, byteLength: number, noAssert?: boolean): number;
  writeIntLE(value: number, offset: number, byteLength: number, noAssert?: boolean): number;
  writeIntBE(value: number, offset: number, byteLength: number, noAssert?: boolean): number;

  readUIntLE(offset: number, byteLength: number, noAssert?: boolean): number;
  readUintLE(offset: number, byteLength: number, noAssert?: boolean): number;
  readUIntBE(offset: number, byteLength: number, noAssert?: boolean): number;
  readUintBE(offset: number, byteLength: number, noAssert?: boolean): number;
  readIntLE(offset: number, byteLength: number, noAssert?: boolean): number;
  readIntBE(offset: number, byteLength: number, noAssert?: boolean): number;

  readUInt8(offset: number, noAssert?: boolean): number;
  readUint8(offset: number, noAssert?: boolean): number;
  readUInt16LE(offset: number, noAssert?: boolean): number;
  readUint16LE(offset: number, noAssert?: boolean): number;
  readUInt16BE(offset: number, noAssert?: boolean): number;
  readUint16BE(offset: number, noAssert?: boolean): number;
  readUInt32LE(offset: number, noAssert?: boolean): number;
  readUint32LE(offset: number, noAssert?: boolean): number;
  readUInt32BE(offset: number, noAssert?: boolean): number;
  readUint32BE(offset: number, noAssert?: boolean): number;
  readBigUInt64LE(offset: number): bigint;
  readBigUInt64BE(offset: number): bigint;

  readInt8(offset: number, noAssert?: boolean): number;
  readInt16LE(offset: number, noAssert?: boolean): number;
  readInt16BE(offset: number, noAssert?: boolean): number;
  readInt32LE(offset: number, noAssert?: boolean): number;
  readInt32BE(offset: number, noAssert?: boolean): number;
  readBigInt64LE(offset: number): bigint;
  readBigInt64BE(offset: number): bigint;

  readFloatLE(offset: number, noAssert?: boolean): number;
  readFloatBE(offset: number, noAssert?: boolean): number;
  readDoubleLE(offset: number, noAssert?: boolean): number;
  readDoubleBE(offset: number, noAssert?: boolean): number;

  reverse(): this;
  swap16(): Buffer;
  swap32(): Buffer;
  swap64(): Buffer;

  writeUInt8(value: number, offset: number, noAssert?: boolean): number;
  writeUint8(value: number, offset: number, noAssert?: boolean): number;
  writeUInt16LE(value: number, offset: number, noAssert?: boolean): number;
  writeUint16LE(value: number, offset: number, noAssert?: boolean): number;
  writeUInt16BE(value: number, offset: number, noAssert?: boolean): number;
  writeUint16BE(value: number, offset: number, noAssert?: boolean): number;
  writeUInt32LE(value: number, offset: number, noAssert?: boolean): number;
  writeUint32LE(value: number, offset: number, noAssert?: boolean): number;
  writeUInt32BE(value: number, offset: number, noAssert?: boolean): number;
  writeUint32BE(value: number, offset: number, noAssert?: boolean): number;
  writeBigUInt64LE(value: bigint, offset: number): number;
  writeBigUInt64BE(value: bigint, offset: number): number;

  writeInt8(value: number, offset: number, noAssert?: boolean): number;
  writeInt16LE(value: number, offset: number, noAssert?: boolean): number;
  writeInt16BE(value: number, offset: number, noAssert?: boolean): number;
  writeInt32LE(value: number, offset: number, noAssert?: boolean): number;
  writeInt32BE(value: number, offset: number, noAssert?: boolean): number;
  writeBigInt64LE(value: bigint, offset: number): number;
  writeBigInt64BE(value: bigint, offset: number): number;

  writeFloatLE(value: number, offset: number, noAssert?: boolean): number;
  writeFloatBE(value: number, offset: number, noAssert?: boolean): number;
  writeDoubleLE(value: number, offset: number, noAssert?: boolean): number;
  writeDoubleBE(value: number, offset: number, noAssert?: boolean): number;

  fill(value: any, offset?: number, end?: number): this;
  indexOf(value: string | number | Buffer, byteOffset?: number, encoding?: string): number;
  lastIndexOf(value: string | number | Buffer, byteOffset?: number, encoding?: string): number;
  includes(value: string | number | Buffer, byteOffset?: number, encoding?: string): boolean;

  /**
   * SLDL extension: reads a zero-terminated string from the buffer.
   * @param offset Byte offset to start reading from.
   * @param encoding Character encoding (defaults to 'utf8').
   */
  readStringZero(offset: number, encoding?: string): string;
  /**
   * SLDL extension: writes a zero-terminated string to the buffer.
   * @param string The string to write (null terminator appended automatically).
   * @param offset Byte offset to start writing at.
   * @param encoding Character encoding (defaults to 'utf8').
   */
  writeStringZero(string: string, offset: number, encoding?: string): void;

  /**
   * Allocates a new buffer containing the given {str}.
   *
   * @param str String to store in buffer.
   * @param encoding encoding to use, optional.  Default is 'utf8'
   */
  constructor(str: string, encoding?: string);
  /**
   * Allocates a new buffer of {size} octets.
   *
   * @param size count of octets to allocate.
   */
  constructor(size: number);
  /**
   * Allocates a new buffer containing the given {array} of octets.
   *
   * @param array The octets to store.
   */
  constructor(array: Uint8Array);
  /**
   * Produces a Buffer backed by the same allocated memory as
   * the given {ArrayBuffer}.
   *
   *
   * @param arrayBuffer The ArrayBuffer with which to share memory.
   */
  constructor(arrayBuffer: ArrayBuffer);
  /**
   * Allocates a new buffer containing the given {array} of octets.
   *
   * @param array The octets to store.
   */
  constructor(array: any[]);
  /**
   * Copies the passed {buffer} data onto a new {Buffer} instance.
   *
   * @param buffer The buffer to copy.
   */
  constructor(buffer: Buffer);
  prototype: Buffer;
  /**
   * Allocates a new Buffer using an {array} of octets.
   *
   * @param array
   */
  static from(array: any[]): Buffer;
  /**
   * When passed a reference to the .buffer property of a TypedArray instance,
   * the newly created Buffer will share the same allocated memory as the TypedArray.
   * The optional {byteOffset} and {length} arguments specify a memory range
   * within the {arrayBuffer} that will be shared by the Buffer.
   *
   * @param arrayBuffer The .buffer property of a TypedArray or a new ArrayBuffer()
   * @param byteOffset
   * @param length
   */
  static from(arrayBuffer: ArrayBuffer, byteOffset?: number, length?: number): Buffer;
  /**
   * Copies the passed {buffer} data onto a new Buffer instance.
   *
   * @param buffer
   */
  static from(buffer: Buffer | Uint8Array): Buffer;
  /**
   * Creates a new Buffer containing the given JavaScript string {str}.
   * If provided, the {encoding} parameter identifies the character encoding.
   * If not provided, {encoding} defaults to 'utf8'.
   *
   * @param str
   */
  static from(str: string, encoding?: string): Buffer;
  /**
   * Returns true if {obj} is a Buffer
   *
   * @param obj object to test.
   */
  static isBuffer(obj: any): obj is Buffer;
  /**
   * Returns true if {encoding} is a valid encoding argument.
   * Valid string encodings in Node 0.12: 'ascii'|'utf8'|'utf16le'|'ucs2'(alias of 'utf16le')|'base64'|'binary'(deprecated)|'hex'
   *
   * @param encoding string to test.
   */
  static isEncoding(encoding: string): boolean;
  /**
   * Gives the actual byte length of a string. encoding defaults to 'utf8'.
   * This is not the same as String.prototype.length since that returns the number of characters in a string.
   *
   * @param string string to test.
   * @param encoding encoding used to evaluate (defaults to 'utf8')
   */
  static byteLength(string: string, encoding?: string): number;
  /**
   * Returns a buffer which is the result of concatenating all the buffers in the list together.
   *
   * If the list has no items, or if the totalLength is 0, then it returns a zero-length buffer.
   * If the list has exactly one item, then the first item of the list is returned.
   * If the list has more than one item, then a new Buffer is created.
   *
   * @param list An array of Buffer objects to concatenate
   * @param totalLength Total length of the buffers when concatenated.
   *   If totalLength is not provided, it is read from the buffers in the list. However, this adds an additional loop to the function, so it is faster to provide the length explicitly.
   */
  static concat(list: Uint8Array[], totalLength?: number): Buffer;
  /**
   * The same as buf1.compare(buf2).
   */
  static compare(buf1: Uint8Array, buf2: Uint8Array): number;
  /**
   * Allocates a new buffer of {size} octets.
   *
   * @param size count of octets to allocate.
   * @param fill if specified, buffer will be initialized by calling buf.fill(fill).
   *    If parameter is omitted, buffer will be filled with zeros.
   * @param encoding encoding used for call to buf.fill while initializing
   */
  static alloc(size: number, fill?: string | Buffer | number, encoding?: string): Buffer;
  /**
   * Allocates a new buffer of {size} octets, leaving memory not initialized, so the contents
   * of the newly created Buffer are unknown and may contain sensitive data.
   *
   * @param size count of octets to allocate
   */
  static allocUnsafe(size: number): Buffer;
  /**
   * Allocates a new non-pooled buffer of {size} octets, leaving memory not initialized, so the contents
   * of the newly created Buffer are unknown and may contain sensitive data.
   *
   * @param size count of octets to allocate
   */
  static allocUnsafeSlow(size: number): Buffer;
}

export function SlowBuffer(length: number): Buffer;
export const INSPECT_MAX_BYTES: number;
export const kMaxLength: number;