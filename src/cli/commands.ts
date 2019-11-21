import { Arguments } from 'yargs';
import * as issueParser from './issue-parser';
import * as watson from './watson';

export async function start(argv: Arguments<{ issue?: string }>): Promise<void> {
  const issue = await issueParser.getIssueFromContext(argv.issue)
    .catch((e) => console.error(e));

  if (issue === undefined) {
    return;
  }

  try {
    watson.start(issue);
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
