import { Frame } from './cli/watson';
import { IssueDetails } from './client/jira';
import moment from 'moment';
import util from 'util';
import { validateIssueKey } from './cli/issueParser';
import yaml from 'js-yaml';

export interface ValidatedIssue {
  key: string;
  accountId?: number;
  summary?: string;
  error?: string;
}

export interface ValidatedFrame {
  issue: ValidatedIssue;
  start: moment.Moment;
  stop: moment.Moment;
}

export function validateIssues(
  issueKeys: Set<string>,
  issueDetails: Map<string, IssueDetails>,
  openAccountIds: Set<number>,
): Map<string, ValidatedIssue> {
  return new Map([...issueKeys].map((key) => {
    const issue = issueDetails.get(key);
    let error;

    if (issue === undefined) {
      error = `${key} does not exist in JIRA`;
    } else if (issue.account === null) {
      error = `${key} is not associated to a Tempo account`;
    } else if (!openAccountIds.has(issue.account.id)) {
      error = `${key} is associated to a closed or archived Tempo account`;
    }

    return [key, { key, accountId: issue?.account?.id, summary: issue?.summary, error }];
  }));
}

export function getValidationErrors(issues: Iterable<ValidatedIssue>): Map<string, string> {
  return new Map(
    [...issues].filter(({ error }) => error !== undefined)
      .map(({ key, error }) => [key, error as string]),
  );
}

export function getValidatedFrames(
  frames: Frame[],
  validatedIssues: Map<string, ValidatedIssue>,
): ValidatedFrame[] {
  return frames.map(({ project, start, stop }) => ({
    issue: validatedIssues.get(project) as ValidatedIssue,
    start,
    stop,
  }));
}

export function groupFramesByDate(frames: ValidatedFrame[]): Map<string, ValidatedFrame[]> {
  const map = new Map<string, ValidatedFrame[]>();

  for (const frame of frames) {
    const date = frame.start.format('YYYY-MM-DD');

    if (!map.has(date)) {
      map.set(date, []);
    }

    (map.get(date) as ValidatedFrame[]).push(frame);
  }

  return map;
}

const indent = (spaces: number, lines: string[]): string[] => (
  lines.map((line) => (' '.repeat(spaces) + line).trimRight())
);

const smartRound = (mins: number): number => (
  (mins < 15 ? 1 : mins % 15 > 5 ? Math.ceil(mins / 15) : Math.floor(mins / 15)) / 4
);

function renderFrame(frame: ValidatedFrame): string[] {
  const { issue: { key, summary, error }, start, stop } = frame;
  const header = summary
    ? [`# ${summary.length > 76 ? `${summary.substring(0, 73)}...` : summary}`]
    : [];
  const interval = [start, stop].map((time) => time.format('k:mm')).join(' - ');

  return [
    ...header,
    `- issue: ${key}${error ? ` # ${error}` : ''}`,
    ...indent(2, [
      `time: ${smartRound(stop.diff(start, 'minutes'))} # ${interval}`,
      'description: .',
    ]),
  ];
}

export function renderFrames(framesByDate: Map<string, ValidatedFrame[]>): string {
  const header = ['# Don\'t forget to fill the descriptions!', ''];

  return [...framesByDate.entries()].reduce((lines, [date, frames]) => [
    ...lines,
    `${date}: # ${moment(date).format('dddd')}`,
    ...indent(2, frames.reduce((lines: string[], frame: ValidatedFrame) => [
      ...lines,
      ...renderFrame(frame),
      '',
    ], [])),
  ], header).join('\n');
}

export interface ParsedFrame {
  issue: string;
  date: moment.Moment;
  time: number;
  description: string;
}

export function parseFrames(text: string): ParsedFrame[] {
  const doc = yaml.safeLoad(text, { schema: yaml.JSON_SCHEMA });

  if (typeof doc !== 'object' || Array.isArray(doc)) {
    throw new Error('expected object at top-level');
  }

  return [...Object.entries(doc)].reduce((result: ParsedFrame[], [date, frames]) => {
    const parsedDate = moment(date, 'YYYY-MM-DD');

    if (!parsedDate.isValid()) {
      throw new Error(`expected valid date, got: ${util.inspect(date)}`);
    }

    if (!Array.isArray(frames)) {
      throw new Error(`expected array of frames, got: ${util.inspect(frames)}`);
    }

    const parsedFrames = frames.map((frame: {
      issue: unknown;
      time: unknown;
      description: object | string | number | undefined | null;
    }) => {
      const { issue, time, description } = frame;

      if (typeof issue !== 'string' || validateIssueKey(issue) !== true) {
        throw new Error(`missing or invalid issue key for frame: ${util.inspect(frame)}`);
      }

      if (typeof time !== 'number' || time <= 0) {
        throw new Error(`missing or invalid time for frame: ${util.inspect(frame)}`);
      }

      if (description === undefined || description === null || description.toString() === '') {
        throw new Error(`missing description for frame: ${util.inspect(frame)}`);
      }

      return { issue, date: parsedDate, time, description: description.toString() };
    });

    return [...result, ...parsedFrames];
  }, []);
}
