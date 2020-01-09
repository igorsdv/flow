import { Moment } from 'moment';
import ValueObject from '../core/ValueObject';

interface ContextualizedFrame {
  readonly issueKey: string;
  readonly issueSummary: string | null;
  readonly issueError: string | null;
  readonly description: string;
  readonly start: Moment;
  readonly end: Moment;
}

class ContextualizedFrame extends ValueObject<ContextualizedFrame> {
  static create(props: ContextualizedFrame): ContextualizedFrame {
    return new ContextualizedFrame(props);
  }
}

export default ContextualizedFrame;
