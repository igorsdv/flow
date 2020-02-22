import WorklogDuration from './WorklogDuration';
import moment from 'moment';

test.each([
  [0, 0.25],
  [5, 0.25],
  [10, 0.25],
  [15, 0.25],
  [20, 0.25],
  [21, 0.5],
  [65, 1],
  [66, 1.25],
])('duration rounds correctly', (minutes, expected) => {
  const worklogDuration = new WorklogDuration(moment.duration(minutes, 'minutes'));

  expect(worklogDuration.asHours()).toBe(expected);
});

test.each([
  [-1, false],
  [0, true],
  [1.25, true],
  [3.76, false],
])('duration from invalid hours throws', (hours, expected) => {
  expect(WorklogDuration.fromHours(hours as number).isOk()).toBe(expected);
});
