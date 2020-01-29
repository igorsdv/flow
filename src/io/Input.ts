import Result from '../core/Result';

export interface Question<T> {
  message: string;
  default?: T;
  filter?: (input: string) => T;
  validate?: (input: string) => Result<void>;
}

export default interface Input {
  confirm(message: string): Promise<boolean>;
  prompt<T>(question: Question<T>): Promise<T>;
}
