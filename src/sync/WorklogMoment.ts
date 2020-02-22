import moment, { Moment } from 'moment';
import Result from '../core/Result';

export default class WorklogMoment {
  constructor(private readonly moment: Moment) {}

  static fromDate(date: string): Result<WorklogMoment> {
    const worklogMoment = moment(date, 'YYYY-MM-DD');

    if (!worklogMoment.isValid()) {
      return Result.err(new Error('The date is invalid'));
    }

    return Result.ok(new WorklogMoment(worklogMoment));
  }

  asDate(): string {
    return this.moment.format('YYYY-MM-DD');
  }
}
