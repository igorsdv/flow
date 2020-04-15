import { AxiosRequestConfig } from 'axios';
import Client from './Client';
import Result from '../../core/Result';

interface AccountsResponse {
  results: {
    id: number;
  }[];
}

interface WorklogRequest {
  issueKey: string;
  timeSpentSeconds: number;
  startDate: string;
  startTime: string;
  description: string;
  authorAccountId: string;
  attributes: {
    key: string;
    value: number;
  }[];
}

interface ErrorResponse {
  errors: {
    message: string;
  }[];
}

export default class TempoClient extends Client {
  protected getBaseConfig(): AxiosRequestConfig {
    return {
      baseURL: this.settingsProvider.getTempoBaseUrl(),
      headers: {
        Authorization: `Bearer ${this.settingsProvider.getTempoApiToken()}`,
      },
    };
  }

  async getOpenAccounts(): Promise<AccountsResponse> {
    return (await this.get<AccountsResponse>('/accounts', { params: { status: 'OPEN' } })).data;
  }

  async createWorklog(request: WorklogRequest): Promise<Result<null, ErrorResponse>> {
    const response = await this.post('/worklogs', request, {
      validateStatus: (status) => status >= 200 && status < 300 || status === 403 || status === 404,
    });

    if (response.status > 400) {
      return Result.err(response.data as ErrorResponse);
    }

    return Result.ok(null);
  }
}
