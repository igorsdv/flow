import ContextualizedFrame from '../sync/ContextualizedFrame';
import Renderer from './Renderer';
import moment from 'moment';

function render(frames: { [key: string]: ContextualizedFrame[] }): string {
  const framesByDate = new Map();

  for (const [key, value] of Object.entries(frames)) {
    const frames = value.map((frame) => ContextualizedFrame.create(frame));

    framesByDate.set(key, frames);
  }

  const result = Renderer.renderFrames(framesByDate);
  const index = result.indexOf('\n');

  expect(result.substring(0, index)).toBe('# Don\'t forget to fill the descriptions!');

  return result.substring(index + 1);
}

test('single frame renders correctly', () => {
  const result = render({
    '2019-11-20': [
      {
        issueKey: 'ABC-123',
        issueSummary: 'Some Task',
        issueError: 'ABC does not exist in JIRA',
        description: 'did some work',
        start: moment('2019-11-20T14:00:00'),
        end: moment('2019-11-20T14:30:00'),
      },
    ],
  });

  expect(result).toBe(`
2019-11-20: # Wednesday
  # Some Task
  - issue: ABC-123 # ABC does not exist in JIRA
    time: 0.5 # 14:00 - 14:30
    description: did some work
`);
});

test('frame without error does not render error comment', () => {
  const result = render({
    '2019-11-20': [
      {
        issueKey: 'ABC-123',
        issueSummary: 'Some Task',
        issueError: null,
        description: 'did some work',
        start: moment('2019-11-20T14:00:00'),
        end: moment('2019-11-20T14:30:00'),
      },
    ],
  });

  expect(result).toBe(`
2019-11-20: # Wednesday
  # Some Task
  - issue: ABC-123
    time: 0.5 # 14:00 - 14:30
    description: did some work
`);
});

test('frame without issue summary does not render issue summary line', () => {
  const result = render({
    '2019-11-20': [
      {
        issueKey: 'ABC-123',
        issueSummary: null,
        issueError: 'ABC does not exist in JIRA',
        description: 'did some work',
        start: moment('2019-11-20T14:00:00'),
        end: moment('2019-11-20T14:30:00'),
      },
    ],
  });

  expect(result).toBe(`
2019-11-20: # Wednesday
  - issue: ABC-123 # ABC does not exist in JIRA
    time: 0.5 # 14:00 - 14:30
    description: did some work
`);
});

test('frame with long issue description renders with ellipsis', () => {
  const result = render({
    '2019-11-20': [
      {
        issueKey: 'ABC-123',
        issueSummary: 'Some Task with a Very Long Issue Summary That Is Really Very Very Very Extremely Long',
        issueError: 'ABC does not exist in JIRA',
        description: 'did some work',
        start: moment('2019-11-20T14:00:00'),
        end: moment('2019-11-20T14:30:00'),
      },
    ],
  });

  expect(result).toBe(`
2019-11-20: # Wednesday
  # Some Task with a Very Long Issue Summary That Is Really Very Very Very Ex...
  - issue: ABC-123 # ABC does not exist in JIRA
    time: 0.5 # 14:00 - 14:30
    description: did some work
`);
});

test('multiple frames render correctly', () => {
  const result = render({
    '2019-11-20': [
      {
        issueKey: 'ABC-123',
        issueSummary: 'Some Task',
        issueError: 'ABC does not exist in JIRA',
        description: 'did some work',
        start: moment('2019-11-20T14:00:00'),
        end: moment('2019-11-20T14:30:00'),
      },
      {
        issueKey: 'TEST-1234',
        issueSummary: 'Some Other Task',
        issueError: null,
        description: 'did other work',
        start: moment('2019-11-20T14:30:00'),
        end: moment('2019-11-20T15:30:00'),
      },
    ],
    '2019-11-21': [
      {
        issueKey: 'ABC-123',
        issueSummary: 'Some Task',
        issueError: 'ABC does not exist in JIRA',
        description: 'did some work',
        start: moment('2019-11-20T11:00:00'),
        end: moment('2019-11-20T11:15:00'),
      },
    ],
  });

  expect(result).toBe(`
2019-11-20: # Wednesday
  # Some Task
  - issue: ABC-123 # ABC does not exist in JIRA
    time: 0.5 # 14:00 - 14:30
    description: did some work

  # Some Other Task
  - issue: TEST-1234
    time: 1 # 14:30 - 15:30
    description: did other work

2019-11-21: # Thursday
  # Some Task
  - issue: ABC-123 # ABC does not exist in JIRA
    time: 0.25 # 11:00 - 11:15
    description: did some work
`);
});
