export class FileSlice {
  static Null: FileSlice;

  file: string;
  content: string[];
  parentLine: number;
  size: number;
  next: FileSlice | null;
  completeFile?: string;

  static copy(a: FileSlice, b?: FileSlice): FileSlice;
  static fromFile(
    file: string,
    content: string,
    start?: number,
    line?: number,
    next?: FileSlice
  ): FileSlice;

  constructor();

  getContent(): string;
  getLine(line: number): string | undefined;
  insert(start: number, inserted: FileSlice): this | undefined;
  clear(line: number, count?: number): this;
  slice(start: number, line: number): FileSlice;
  duplicate(start: number, line: number, count: number): void;
  replaceWord(line: number, begin: number, length: number, string: string): void;
  flatten(): FileSlice;
  toString(): string;
}