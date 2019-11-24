import * as config from 'flow/config';
import lazyClient from 'flow/client/lazyClient';

const client = lazyClient(() => {
  const { tempoApiToken } = config.load();
  return {
    baseURL: 'https://api.tempo.io/core/3',
    headers: {
      Authorization: `Bearer ${tempoApiToken}`,
    },
  };
});

export async function getOpenAccountIds(): Promise<number[]> {
  const { data: { results } } = await client.get<{
    results: { id: number }[];
  }>('/accounts', { params: { status: 'OPEN' } });

  return results.map(({ id }) => id);
}
