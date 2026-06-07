export class FileInterface {
  /**
   * Returns `true` if the path exists, `false` otherwise.
   */
  existSync(path: string): boolean;

  /**
   * Synchronously reads the entire contents of a file.
   */
  readFileSync(path: string): string;
};