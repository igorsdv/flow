import * as config from '../config';
import { ParsedFrame } from '../frames';
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

export async function createNewWorklog(
  { issue, date, time, description }: ParsedFrame,
  userAccountId: string,
  issueAccountId: number,
): Promise<void> {
  await client.post('/worklogs', {
    issueKey: issue,
    timeSpentSeconds: time * 3600,
    startDate: date.format('YYYY-MM-DD'),
    startTime: '00:00:00',
    description,
    authorAccountId: userAccountId,
    attributes: [{
      key: '_Account_',
      value: issueAccountId,
    }],
  });
}
