import Issue from '../sync/Issue';
import JiraClient from './client/JiraClient';
import Synchronizer from '../sync/Synchronizer';
import TempoClient from './client/TempoClient';
import Worklog from '../sync/Worklog';

export default class JiraSynchronizer implements Synchronizer {
  constructor(
    private jiraClient: JiraClient,
    private tempoClient: TempoClient,
  ) {}

  async getIssuesByKeys(keys: string[]): Promise<Map<string, Issue>> {
    const result = new Map<string, Issue>();
    const { issues } = await this.jiraClient.searchIssueKeys(keys);

    for (const { key, fields } of issues) {
      const { summary, 'io.tempo.jira__account': jiraAccount } = fields;
      const account = jiraAccount === null ? null : {
        id: jiraAccount.id,
        name: jiraAccount.value,
      };

      result.set(key, Issue.create({ key, summary, account }));
    }

    return result;
  }

  async getOpenAccountIds(): Promise<number[]> {
    const { results } = await this.tempoClient.getOpenAccounts();

    return results.map(({ id }) => id);
  }

  async push(worklogs: Worklog[]): Promise<[string, Error[]][]> {
    const issueKeys = worklogs.map(({ issueKey }) => issueKey);
    const [{ accountId }, issues] = await Promise.all([
      this.jiraClient.getMyself(),
      this.getIssuesByKeys(issueKeys),
    ]);

    const requests = worklogs.map((worklog) => this.createWorklog(worklog, accountId, issues));

    return Promise.all(requests);
  }

  private async createWorklog(
    { issueKey, description, duration, moment }: Worklog,
    accountId: string,
    issues: Map<string, Issue>,
  ): Promise<[string, Error[]]> {
    const issue = issues.get(issueKey);

    if (!issue) {
      return [
        issueKey,
        [new Error(`${issueKey} does not exist in JIRA`)],
      ];
    }

    if (issue.account === null) {
      return [
        issueKey,
        [new Error(`${issueKey} is not associated to a Tempo account`)],
      ];
    }

    const request = {
      issueKey,
      timeSpentSeconds: duration.asSeconds(),
      startDate: moment.asDate(),
      startTime: '00:00:00',
      description,
      authorAccountId: accountId,
      attributes: [{
        key: '_Account_',
        value: issue.account.id,
      }],
    };

    const result = await this.tempoClient.createWorklog(request);
    const errors = result.isOk() ? [] : result.error().errors.map(({ message }) => (
      new Error(`${message}`)
    ));

    return [issueKey, errors];
  }
}
