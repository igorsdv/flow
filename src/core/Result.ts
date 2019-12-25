export const enum ResultTag {
  Ok,
  Err,
}

interface Ok<T> {
  value: T;
  tag: ResultTag.Ok;
}

interface Err<E extends Error> {
  value: E;
  tag: ResultTag.Err;
}

export default class Result<T, E extends Error = Error> {
  private constructor(readonly value: T | E, readonly tag: ResultTag) {};

  static ok<T>(value: T): Result<T, never> & Ok<T> {
    return new Result(value, ResultTag.Ok) as Result<T, never> & Ok<T>;
  }

  static err<E extends Error>(value: E): Result<never, E> & Err<E> {
    return new Result(value, ResultTag.Err) as Result<never, E> & Err<E>;
  }

  isOk(): this is Ok<T> {
    return this.tag === ResultTag.Ok;
  }
}
