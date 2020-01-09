/* eslint-disable max-classes-per-file */

class Ok<T, E> {
  constructor(private readonly value: T) {}

  isOk(): this is Ok<T, E> {
    return true;
  }

  get(): T {
    return this.value;
  }

  getOrThrow(): T {
    return this.value;
  }

  then<U, F>(f: (arg: T) => Result<U, F>): Result<U, E | F> {
    return f(this.value);
  }
}

class Err<T, E> {
  constructor(private readonly value: E) {}

  isOk(): this is Ok<T, E> {
    return false;
  }

  error(): E {
    return this.value;
  }

  getOrThrow(): T {
    throw this.value;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  then<U, F>(this: Err<U, E>, _f: (arg: T) => Result<U, F>): Result<U, E | F> {
    return this;
  }
}

const Result = class {
  static ok<T>(value: T): Ok<T, never> {
    return new Ok(value);
  }

  static err<E>(value: E): Err<never, E> {
    return new Err(value);
  }
};

type Result<T, E = Error> = Ok<T, E> | Err<T, E>;

export default Result;
