import * as jira from '../client/jira';
import * as tempo from '../client/tempo';
import { groupFramesByDate, parseFrames, renderFrames, validateFrames } from '../frames';
import { Frame } from './watson';
import { edit } from 'external-editor';
import inquirer from 'inquirer';

async function confirmProceed(): Promise<boolean> {
  const { proceed } = await inquirer.prompt({
    name: 'proceed',
    type: 'confirm',
    message: 'Do you wish to proceed?',
  });

  return proceed;
}

export default async function (frames: Frame[]): Promise<void> {
  const issueKeys = [...new Set(frames.map(({ project }) => project))];

  if (issueKeys.length === 0) {
    console.log('No pending worklogs to push.');
    return;
  }

  process.stdout.write('Validating pending issues... ');

  const [issueDetails, openAccountIds] = await Promise.all([
    jira.getIssueDetails(issueKeys),
    tempo.getOpenAccountIds(),
  ]);

  const { validatedFrames, errors } = validateFrames(frames, issueDetails, openAccountIds);

  if (errors.length > 0) {
    console.log('Found the following errors:\n');
    errors.forEach((error) => console.log(`- ${error}`));
    console.log('');

    if (!await confirmProceed()) {
      return;
    }
  } else {
    console.log('Success');
  }

  const framesByDate = groupFramesByDate(validatedFrames);
  const submission = edit(renderFrames(framesByDate), {
    postfix: '.yml',
  });

  console.log(parseFrames(submission));
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
