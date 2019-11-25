import * as config from '../config';
import * as watson from './watson';
import { getIssueFromArgument, getIssueFromContext } from './issueParser';
import { Arguments } from 'yargs';
import pushOperation from './pushOperation';

interface Options {
  issue?: string;
  noInteraction: boolean;
}

export async function start(argv: Arguments<Options>): Promise<void> {
  const { issue, noInteraction } = argv;
  const issueKey = await (issue ? getIssueFromArgument(issue) : getIssueFromContext(noInteraction))
    .catch((e) => console.error(e));

  if (issueKey === undefined) {
    return;
  }

  try {
    watson.stop({ silent: 'error' });
    watson.start(issueKey);
  } catch (e) {
    watson.showInstallationHelp();
  }
}

export function stop(): void {
  try {
    watson.stop();
  } catch (e) {
    watson.showInstallationHelp();
  }
}

export function cancel(): void {
  try {
    watson.cancel();
  } catch (e) {
    watson.showInstallationHelp();
  }
}

export async function setup(): Promise<void> {
  try {
    await config.setup();
  } catch (e) {
    console.error(e.message);
  }
}

export async function push(): Promise<void> {
  let frames: watson.Frame[];

  try {
    watson.stop({ silent: 'error' });
    frames = watson.getPendingFrames();
  } catch (e) {
    watson.showInstallationHelp();
    return;
  }

  try {
    pushOperation(frames);
  } catch (e) {
    console.error(e.message);
    console.error('\nPlease make sure to run `flow setup` and enter the correct credentials.');
  }
}
