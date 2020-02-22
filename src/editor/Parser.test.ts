import Parser from './Parser';
import Worklog from '../sync/Worklog';

function mapWorklog(worklog: Worklog): object {
  const { issueKey, description, duration, moment } = worklog;

  return {
    issueKey,
    description,
    hours: duration.asHours(),
    date: moment.asDate(),
  };
}

function parse(text: string): object[] {
  return Parser.parseWorklogs(text).getOrThrow().map(mapWorklog);
}

test('single issue parses correctly', () => {
  const result = parse(`
    '2019-11-20':
      - issue: ABC-123
        time: 1.75
        description: did some work
  `);

  expect(result).toEqual([
    { issueKey: 'ABC-123', description: 'did some work', hours: 1.75, date: '2019-11-20' },
  ]);
});

test('single issue on multiple dates parses correctly', () => {
  const result = parse(`
    '2019-11-20':
      - issue: ABC-123
        time: 1.75
        description: did some work

    '2019-11-21':
      - issue: ABC-123
        time: 1.25
        description: did other work
  `);

  expect(result).toEqual([
    { issueKey: 'ABC-123', description: 'did some work', hours: 1.75, date: '2019-11-20' },
    { issueKey: 'ABC-123', description: 'did other work', hours: 1.25, date: '2019-11-21' },
  ]);
});

test('duplicated issue on same date parses as two worklogs', () => {
  const result = parse(`
    '2019-11-20':
      - issue: ABC-123
        time: 1.75
        description: did some work
      - issue: ABC-123
        time: 1.25
        description: did other work
  `);

  expect(result).toEqual([
    { issueKey: 'ABC-123', description: 'did some work', hours: 1.75, date: '2019-11-20' },
    { issueKey: 'ABC-123', description: 'did other work', hours: 1.25, date: '2019-11-20' },
  ]);
});

test('mutiple issues parse correctly', () => {
  const result = parse(`
    '2019-11-20':
      - issue: ABC-123
        time: 1.75
        description: did some work
      - issue: ABC-456
        time: 0.25
        description: did other work
    '2019-11-21':
      - issue: ABC-123
        time: 1.75
        description: did some work
      - issue: ABC-789
        time: 0.250
        description: did other work
      - issue: TEST-1234
        time: 1
        description: 'did a lot of work'
  `);

  expect(result).toEqual([
    { issueKey: 'ABC-123', description: 'did some work', hours: 1.75, date: '2019-11-20' },
    { issueKey: 'ABC-456', description: 'did other work', hours: 0.25, date: '2019-11-20' },
    { issueKey: 'ABC-123', description: 'did some work', hours: 1.75, date: '2019-11-21' },
    { issueKey: 'ABC-789', description: 'did other work', hours: 0.25, date: '2019-11-21' },
    { issueKey: 'TEST-1234', description: 'did a lot of work', hours: 1.00, date: '2019-11-21' },
  ]);
});

test('date without worklogs parses as empty', () => {
  const result = parse(`
    '2019-11-20': []
  `);

  expect(result).toEqual([]);
});

test('duplicate dates throw', () => {
  const run = (): void => {
    parse(`
      '2019-11-20':
        - issue: ABC-123
          time: 1.75
          description: did some work

      '2019-11-20':
        - issue: ABC-456
          time: 1.25
          description: did other work
    `);
  };

  expect(run).toThrowError(/duplicated mapping key/);
});

test('document that is not an object throws', () => {
  const run = (): void => {
    parse(`
      - issue: ABC-123
        time: 1.75
        description: did some work
    `);
  };

  expect(run).toThrowError(/expected object/);
});

test('invalid date throws', () => {
  const run = (): void => {
    parse(`
      '2019-99-00':
        - issue: ABC-123
          time: 1.75
          description: did some work
    `);
  };

  expect(run).toThrowError(/expected valid date/);
});

test('worklog list that is not array throws', () => {
  const run = (): void => {
    parse(`
      '2019-11-20':
        issue: ABC-123
        time: 1.75
        description: did some work
    `);
  };

  expect(run).toThrowError(/expected array/);
});

test('worklog that is not object throws', () => {
  const run = (): void => {
    parse(`
      '2019-11-20':
        - ABC-123
    `);
  };

  expect(run).toThrowError(/expected object/);
});

test('issue key that is not string throws', () => {
  const run = (): void => {
    parse(`
      '2019-11-20':
        - issue: 123
          time: 1.75
          description: did some work
    `);
  };

  expect(run).toThrowError(/expected string/);
});

test('time that is not a number throws', () => {
  const run = (): void => {
    parse(`
      '2019-11-20':
        - issue: ABC-123
          time: '1.75'
          description: did some work
    `);
  };

  expect(run).toThrowError(/expected number/);
});

test('missing description throws', () => {
  const run = (): void => {
    parse(`
      '2019-11-20':
        - issue: ABC-123
          time: 1.75
          description:
    `);
  };

  expect(run).toThrowError(/expected string/);
});

test('description that is not a string throws', () => {
  const run = (): void => {
    parse(`
      '2019-11-20':
        - issue: ABC-123
          time: 1.75
          description: [some, work]
    `);
  };

  expect(run).toThrowError(/expected string/);
});
