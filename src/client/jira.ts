import * as config from '../config';
import lazyClient from './lazy-client';

const client = lazyClient(() => {
  const { email, jiraApiToken } = config.load();
  return {
    baseURL: 'https://absolunet.jira.com/rest/api/3',
    auth: {
      username: email,
      password: jiraApiToken,
    },
  };
});

export interface UserDetails {
  accountId: string;
}

export interface IssueDetails {
  [key: string]: {
    account: {
      id: number;
      value: string;
    } | null;
    key: string;
    summary: string;
  };
}

export async function getUserDetails(): Promise<UserDetails> {
  const { data: { accountId } } = await client.get('/myself');
  return { accountId };
}

export async function getIssueDetails(issueKeys: string[]): Promise<IssueDetails> {
  const { data: { issues } } = await client.post<{
    issues: {
      key: string;
      fields: {
        summary: string;
        'io.tempo.jira__account': {
          id: number;
          value: string;
        } | null;
      };
    }[];
  }>('/search', {
    jql: `key IN (${issueKeys.join(',')})`,
    fields: ['summary', 'io.tempo.jira__account'],
    fieldsByKeys: true,
  });

  return issues.reduce((result: IssueDetails, {
    key,
    fields: {
      'io.tempo.jira__account': account,
      summary,
    },
  }) => ({
    [key]: { account, key, summary },
    ...result,
  }), {});
}
