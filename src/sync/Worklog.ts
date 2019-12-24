import moment from 'moment';
import Entity from '../core/Entity';
import Result from '../core/Result';
import BaseError from '../core/BaseError';

interface WorklogProps {
  issueKey: string;
  description: string;
  duration: moment.Duration;
}

const validateIssueKey = (issueKey: string) => /^[A-Z]+-[0-9]+$/.test(issueKey)

export default class Worklog extends Entity<WorklogProps> {
  static create({ issueKey, description, duration }: WorklogProps): Result<Worklog> {
    if (!validateIssueKey(issueKey)) {
      return Result.err(new InvalidIssueKeyError())
    }

    return new Worklog({})
  }
}

export class InvalidIssueKeyError extends BaseError {}
