import Result from '../core/Result';
import ValueObject from '../core/ValueObject';
import WorklogDuration from './WorklogDuration';
import WorklogMoment from './WorklogMoment';

interface Worklog {
  readonly issueKey: string;
  readonly description: string;
  readonly duration: WorklogDuration;
  readonly moment: WorklogMoment;
}

class Worklog extends ValueObject<Worklog> {
  static create(props: Worklog): Result<Worklog> {
    const { issueKey, description } = props;

    if (!/^[A-Z]+-[0-9]+$/.test(issueKey)) {
      return Result.err(new Error(`The issue key ${issueKey} is invalid.`));
    }

    if (description === '') {
      return Result.err(new Error('The description is required.'));
    }

    return Result.ok(new Worklog(props));
  }
}

export default Worklog;
