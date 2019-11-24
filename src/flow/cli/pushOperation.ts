import * as jira from 'flow/client/jira';
import * as tempo from 'flow/client/tempo';
import DefaultMap from 'flow/defaultMap';
import { Frame } from 'flow/cli/watson';
import { edit } from 'external-editor';
import inquirer from 'inquirer';
import moment from 'moment';

function validateIssues(
  issueKeys: string[],
  issueDetails: jira.IssueDetails,
  openAccountIds: number[],
): Error[] {
  const issueErrors = issueKeys
    .filter((issueKey) => !(issueKey in issueDetails))
    .map((issueKey) => new Error(`${issueKey} does not exist in JIRA`));

  const accountErrors = Object.values(issueDetails)
    .filter(({ account }) => account === null || !(account.id in openAccountIds))
    .map(({ key, account }) => new Error(
      account === null
        ? `${key} is not associated to a Tempo account`
        : `${key} is associated to a closed or archived Tempo account`,
    ));

  return [...issueErrors, ...accountErrors];
}

async function confirmProceed(): Promise<boolean> {
  const { proceed } = await inquirer.prompt({
    name: 'proceed',
    type: 'confirm',
    message: 'Would you like to proceed?',
  });

  return proceed;
}

function groupFramesByDate(frames: Frame[]): DefaultMap<string, Frame[]> {
  const map = new DefaultMap<string, Frame[]>([]);

  for (const frame of frames) {
    const date = frame.start.format('YYYY-MM-DD');
    map.get(date).push(frame);
  }

  return map;
}

function renderFrames(
  framesByDate: Map<string, Frame[]>,
  issueDetails: jira.IssueDetails,
): string {
  const indent = (spaces: number, lines: string[]): string[] => (
    lines.map((line) => ' '.repeat(spaces) + line)
  );

  const smartRound = (mins: number): number => (
    (mins < 15 ? 1 : mins % 15 > 5 ? Math.ceil(mins / 15) : Math.floor(mins / 15)) / 4
  );

  const renderFrame = ({ project, start, stop }: Frame): string[] => {
    const lines = [];

    if (issueDetails[project] !== undefined) {
      const { summary } = issueDetails[project];
      lines.push(`# ${summary.length > 76 ? `${summary.substring(0, 76)}...` : summary}`);
    }

    return [
      ...lines,
      `${project}:`,
      ...indent(2, [
        `time: ${smartRound(stop.diff(start, 'minutes'))}`,
        'description: .',
      ]),
    ];
  };

  let lines = ['# Don\'t forget to fill the descriptions!', ''];

  for (const [date, frames] of framesByDate) {
    lines.push(`${date}: # ${moment(date).format('dddd')}`);
    lines = lines.concat(...frames.map((frame) => [
      ...indent(2, renderFrame(frame)),
      '',
    ]));
  }

  return lines.join('\n');
}

export default async function (frames: Frame[]): Promise<void> {
  const issueKeys = [...new Set(frames.map(({ project }) => project))];

  if (issueKeys.length === 0) {
    console.log('No pending worklogs to push.');
    return;
  }

  process.stdout.write('Validating issues... ');

  const [issueDetails, openAccountIds] = await Promise.all([
    jira.getIssueDetails(issueKeys),
    tempo.getOpenAccountIds(),
  ]);

  const errors = validateIssues(issueKeys, issueDetails, openAccountIds);

  if (errors.length > 0) {
    console.log('Found the following errors:\n');
    errors.forEach((e) => console.log(`- ${e.message}`));
    console.log('');

    if (!await confirmProceed()) {
      return;
    }
  } else {
    console.log('Success');
  }

  const framesByDate = groupFramesByDate(frames);
  const submission = edit(renderFrames(framesByDate, issueDetails), {
    postfix: '.yml',
  });

  console.log(submission);
}

// add tag flow.pending when starting
// filter on tag when aggregating
// rename tag to flow.pushed after successful push

// 1. validate issues
// 2. validate accounts
// The following errors were encoutnered: ... You can fix them in the editor view. Proceed anyway?
// 2. open editor with descriptions etc
// 3. load with js-yaml and validate. prompt to open again on error
// 3. push

// round = m => (m < 15 ? 1 : m % 15 > 5 ? Math.ceil(m / 15) : Math.floor(m / 15)) / 4
// format = min => (min < 60 ? '' : Math.floor(min / 60) + 'h ') + min % 60 + 'm'

/**
 * flow start --at 20:15
 * flow add SAQUMA-123 6h 15m
 *
 */
