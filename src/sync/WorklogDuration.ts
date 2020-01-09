import moment, { Duration } from 'moment';
import Result from '../core/Result';

function minutesToUnits(minutes: number): number {
  if (minutes < 15) {
    return 1;
  }

  const units = minutes / 15;
  const remainder = minutes % 15;

  return remainder > 5 ? Math.ceil(units) : Math.floor(units);
}

export default class WorklogDuration {
  private readonly duration: Duration;

  constructor(duration: Duration) {
    const minutes = duration.asMinutes();
    const units = minutesToUnits(minutes);

    this.duration = moment.duration(units * 15, 'minutes');
  }

  static fromHours(hours: number): Result<WorklogDuration> {
    if (hours < 0 || !Number.isInteger(hours * 4)) {
      return Result.err(new Error('The duration is invalid.'));
    }

    const duration = moment.duration(hours, 'hours');

    return Result.ok(new WorklogDuration(duration));
  }

  asHours(): number {
    return this.duration.asHours();
  }
}
