import * as watson from 'flow/cli/watson';
import { IssueDetails } from 'flow/client/jira';
import moment from 'moment';

export interface ValidatedIssue {
  key: string;
  summary?: string;
  error?: string;
}

export interface ValidatedFrame {
  issue: ValidatedIssue;
  start: moment.Moment;
  stop: moment.Moment;
}

function validateIssues(
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

    return [key, { key, summary: issue?.summary, error }];
  }));
}

function getValidationErrors(issues: Iterable<ValidatedIssue>): string[] {
  return Array.from(issues, ({ error }) => error)
    .filter((error) => error !== undefined) as string[];
}

interface FrameValidationResult {
  validatedFrames: ValidatedFrame[];
  errors: string[];
}

export function validateFrames(
  frames: watson.Frame[],
  issueDetails: Map<string, IssueDetails>,
  openAccountIds: Set<number>,
): FrameValidationResult {
  const issueKeys = new Set(frames.map(({ project }) => project));
  const validatedIssues = validateIssues(issueKeys, issueDetails, openAccountIds);

  return {
    validatedFrames: frames.map(({ project, start, stop }) => ({
      issue: validatedIssues.get(project) as ValidatedIssue,
      start,
      stop,
    })),
    errors: getValidationErrors(validatedIssues.values()),
  };
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
  const lines = [
    summary ? `# ${summary.length > 76 ? `${summary.substring(0, 76)}...` : summary}` : null,
    error ? `ERROR: ${error}` : null,
    `${key}:`,
    ...indent(2, [
      `time: ${smartRound(stop.diff(start, 'minutes'))}`,
      'description: .',
    ]),
  ];

  return lines.filter((line) => line !== null) as string[];
}

export function renderFrames(framesByDate: Map<string, ValidatedFrame[]>): string[] {
  const header = ['# Don\'t forget to fill the descriptions!', ''];

  return [...framesByDate.entries()].reduce((lines, [date, frames]) => [
    ...lines,
    '',
    `${date}: # ${moment(date).format('dddd')}`,
    ...indent(2, frames.reduce((lines: string[], frame: ValidatedFrame) => [
      ...lines,
      '',
      ...indent(2, renderFrame(frame)),
    ], [])),
  ], header);
}
