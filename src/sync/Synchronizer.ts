import Issue, { AccountId } from './Issue';
import Result from '../core/Result';
import Worklog from './Worklog';

export default interface Synchronizer {
  getIssuesByKeys(keys: string[]): Promise<Map<string, Issue>>;
  getOpenAccountIds(): Promise<AccountId[]>;
  push(worklogs: Worklog[]): Promise<Result<void, Error[]>>;
}
