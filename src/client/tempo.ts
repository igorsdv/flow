import * as config from '../config';
import lazyClient from './lazyClient';

const client = lazyClient(() => {
  const { tempoApiToken } = config.load();
  return {
    baseURL: 'https://api.tempo.io/core/3',
    headers: {
      Authorization: `Bearer ${tempoApiToken}`,
    },
  };
});

export async function getOpenAccountIds(): Promise<Set<number>> {
  const { data: { results } } = await client.get<{
    results: { id: number }[];
  }>('/accounts', { params: { status: 'OPEN' } });

  return new Set(results.map(({ id }) => id));
}
