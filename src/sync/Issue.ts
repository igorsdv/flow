import ValueObject from '../core/ValueObject';

export type AccountId = number;

interface Account {
  readonly id: AccountId;
  readonly name: string;
}

interface Issue {
  readonly key: string;
  readonly summary: string;
  readonly account: Account | null;
}

class Issue extends ValueObject<Issue> {
  static create(props: Issue): Issue {
    return new Issue(props);
  }
}

export default Issue;
