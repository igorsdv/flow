import { AxiosRequestConfig } from 'axios';
import Client from './Client';

interface MyselfResponse {
  accountId: string;
}

interface IssuesSearchResponse {
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
}

export default class JiraClient extends Client {
  protected getBaseConfig(): AxiosRequestConfig {
    return {
      baseURL: this.settingsProvider.getJiraBaseUrl(),
      auth: {
        username: this.settingsProvider.getJiraUsername(),
        password: this.settingsProvider.getJiraPassword(),
      },
    };
  }

  async getMyself(): Promise<MyselfResponse> {
    return (await this.get<MyselfResponse>('/myself')).data;
  }

  async searchIssueKeys(keys: string[]): Promise<IssuesSearchResponse> {
    return (await this.post<IssuesSearchResponse>('/search', {
      jql: `key IN (${keys.join(',')})`,
      fields: ['summary', 'io.tempo.jira__account'],
    })).data;
  }
}
