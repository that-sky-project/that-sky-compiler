export class CompileException extends Error {
  context: any;
  constructor(msg: string, token: any);
  as(): string;
}

export class SimpleCompileExceptionBuilder {
  message: string;
  constructor(msg: string);
  from(token?: any): CompileException;
}

export class DynamicCompileExceptionBuilder {
  builder: (token: any, ...args: any[]) => string;
  constructor(builder: (token: any, ...args: any[]) => string);
  from(token: any, ...args: any[]): CompileException;
}

export const kBulitInExceptions: {
  readonly Unexpected: DynamicCompileExceptionBuilder;
  readonly DuplicatedMember: DynamicCompileExceptionBuilder;
  readonly InvalidType: DynamicCompileExceptionBuilder;
  readonly InvalidRef: DynamicCompileExceptionBuilder;
  readonly StructInvalidMemberType: DynamicCompileExceptionBuilder;
  readonly ClassInvalidParentType: DynamicCompileExceptionBuilder;
  readonly MultipleDefinition: DynamicCompileExceptionBuilder;
  readonly Undeclared: DynamicCompileExceptionBuilder;
  readonly TooManyError: SimpleCompileExceptionBuilder;
  readonly UnexpectedEOF: SimpleCompileExceptionBuilder;
};