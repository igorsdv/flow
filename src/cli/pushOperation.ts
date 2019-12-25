import * as jira from '../client/jira';
import * as tempo from '../client/tempo';
import * as watson from './watson';
import { ParsedFrame, ValidatedFrame, getValidatedFrames, getValidationErrors, groupFramesByDate, parseFrames, renderFrames, validateIssues, ValidatedIssue } from '../frames';
import chalk from 'chalk';
import { edit } from 'external-editor';
import inquirer from 'inquirer';

async function confirmProceed(message: string): Promise<boolean> {
  const { proceed } = await inquirer.prompt({
    name: 'proceed',
    type: 'confirm',
    message,
  });

  return proceed;
}

async function validateIssuesAndConfirm(
  issueKeys: Set<string>,
): Promise<[Map<string, ValidatedIssue>, Map<string, string>]> {
  const [issueDetails, openAccountIds] = await Promise.all([
    jira.getIssueDetails([...issueKeys]),
    tempo.getOpenAccountIds(),
  ]);

  const validatedIssues = validateIssues(issueKeys, issueDetails, openAccountIds);
  const errors = getValidationErrors(validatedIssues.values());

  return [validatedIssues, errors];
}

async function validateFramesAndConfirm(frames: watson.Frame[]): Promise<ValidatedFrame[] | null> {
  const issueKeys = new Set(frames.map(({ project }) => project));

  if (issueKeys.size === 0) {
    console.log('No pending worklogs to push.');

    return null;
  }

  process.stdout.write('Validating pending issues... ');
  const [validatedIssues, errors] = await validateIssuesAndConfirm(issueKeys);

  if (errors.size > 0) {
    console.log('Found the following errors:\n');
    errors.forEach((error) => console.log(`- ${error}`));
    console.log('');

    if (!await confirmProceed('Do you wish to proceed?')) {
      console.log('Push aborted.');

      return null;
    }
  } else {
    console.log('Success');
  }

  console.log('');

  return getValidatedFrames(frames, validatedIssues);
}

async function editFramesAndParse(frames: ValidatedFrame[]): Promise<ParsedFrame[] | null> {
  const framesByDate = groupFramesByDate(frames);
  let text = renderFrames(framesByDate);
  let parsedFrames: ParsedFrame[];

  while (true) { // eslint-disable-line no-constant-condition
    try {
      process.stdout.write('Waiting for the editor to close the file...');
      text = edit(text, { postfix: '.yml' });
      process.stdout.write('\r');
      parsedFrames = parseFrames(text);

      break;
    } catch (e) {
      console.log(`Validation failed: ${e.message}\n`);

      // eslint-disable-next-line no-await-in-loop
      if (!await confirmProceed('Open for editing again?')) {
        console.log('Push aborted.');

        return null;
      }

      console.log('');
    }
  }

  return parsedFrames;
}

export default async function (frames: Frame[]): Promise<void> {
  const validatedFrames = await validateFramesAndConfirm(frames);

  if (validatedFrames === null) {
    return;
  }

  const parsedFrames = await editFramesAndParse(validatedFrames);

  if (parsedFrames === null) {
    return;
  }

  console.log('Validating issues to be submitted...');

  const issueKeys = new Set(parsedFrames.map(({ issue }) => issue));
  const [[validatedIssues, errors], { accountId }] = await Promise.all([
    validateIssuesAndConfirm(issueKeys),
    jira.getUserDetails(),
  ]);

  const validParsedFrames = parsedFrames.filter(({ issue }) => !errors.has(issue));
  const requests = validParsedFrames.map((parsedFrame) => tempo.createNewWorklog(
    parsedFrame,
    accountId,
    (validatedIssues.get(parsedFrame.issue) as ValidatedIssue).accountId as number,
  ).catch(() => new Error(parsedFrame.issue)));

  if (requests.length === 0) {
    console.log(chalk.red('No valid issues to submit. All worklogs returned to pending state.'));

    return;
  }

  console.log('Submitting...');

  const results = await Promise.all(requests);
  const errorResults = results.filter((result) => result instanceof Error);

  if (results.length === errorResults.length) {
    console.log(chalk.red('All requests failed. All worklogs returned to pending state.'));

    return;
  }

  console.log('Finalizing...');

  try {
    watson.renamePendingTag();
  } catch (e) {
    console.log(chalk.red('Finalization failed. Worklogs might incorrectly remain in pending state.'));

    return;
  }

  const allErrors = [...errors.keys(), ...errorResults.map((e) => (e as Error).message)];

  if (allErrors.length > 0) {
    console.log(chalk.red('Some requests failed. You will need to submit the worklogs manually for the following issues:\n'));
    allErrors.forEach((key) => console.log(chalk.red(`- ${key}`)));
  } else {
    console.log(chalk.green('Done.'));
  }
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
