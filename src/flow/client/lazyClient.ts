import axios, { AxiosInstance, AxiosRequestConfig, AxiosStatic } from 'axios';

export default function (configProvider: () => AxiosRequestConfig): AxiosStatic {
  let client: AxiosInstance | undefined;

  return new Proxy(axios, {
    get: (target, prop): unknown => {
      if (client === undefined) {
        client = axios.create(configProvider());
      }

      return Reflect.get(Reflect.has(client, prop) ? client : target, prop);
    },
  });
}
