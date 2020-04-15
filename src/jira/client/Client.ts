import { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import JiraSettingsProvider from '../JiraSettingsProvider';

export default abstract class Client {
  constructor(
    protected settingsProvider: JiraSettingsProvider,
    private axios: AxiosInstance,
  ) {}

  protected abstract getBaseConfig(): AxiosRequestConfig;

  protected get<T>(url: string, config: AxiosRequestConfig = {}): Promise<AxiosResponse<T>> {
    return this.axios.get<T>(url, { ...this.getBaseConfig(), ...config });
  }

  protected post<T>(
    url: string,
    data: object = {},
    config: AxiosRequestConfig = {},
  ): Promise<AxiosResponse<T>> {
    return this.axios.post<T>(url, data, { ...this.getBaseConfig(), ...config });
  }
}
