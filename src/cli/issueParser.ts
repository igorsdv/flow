import { exec } from './shell';
import inquirer from 'inquirer';

export function validateIssueKey(input: string): true | string {
  const message = 'The issue key format is not valid.';

  return /^[A-Za-z]+-[0-9]+$/.test(input) || message;
}

function filterIssueKey(input: string): string {
  return input.toUpperCase();
}

function getIssueFromGitBranch(): string | null {
  const command = 'git branch | grep "^*" | egrep -o "[A-Z]+-[0-9]+"';
  const issues = exec(command).trim().split('\n');

  return issues.length === 1 && issues[0] || null;
}

async function getIssueFromInput(defaultValue: string | null): Promise<string> {
  return inquirer.prompt({
    name: 'issue',
    message: 'Please enter the issue key:',
    validate: validateIssueKey,
    filter: filterIssueKey,
    default: defaultValue,
  }).then(({ issue }) => issue as string);
}

export async function getIssueFromArgument(input: string): Promise<string> {
  const result = validateIssueKey(input);

  if (result === true) {
    return filterIssueKey(input);
  }

  throw result;
}

export async function getIssueFromContext(noInteraction: boolean): Promise<string> {
  const issue = getIssueFromGitBranch();

  return noInteraction ? getIssueFromArgument(issue || '') : getIssueFromInput(issue);
}
