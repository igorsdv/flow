import uuid from 'uuid/v4';

export default abstract class Entity<T> {
  readonly id: string;

  protected constructor(protected props: T, id?: string) {
    this.id = id || uuid();
  };
}
