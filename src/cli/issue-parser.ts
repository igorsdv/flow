import inquirer from 'inquirer';
import { exec } from './shell';

function validateIssueKey(input: string): true | string {
  const message = 'The issue key format is not valid.';

  return /^[A-Za-z]+-[0-9]+$/.test(input) || message;
}

function filterIssueKey(input: string): string {
  return input.toUpperCase();
}

function getIssueFromGitBranch(): string | null {
  const command = 'git branch | grep "^*" | egrep -o "[A-Z]+-[0-9]+"';
  const issues = exec(command).trim().split('\n');

  return issues.length === 1 ? issues[0] : null;
}

async function getIssueFromInput(): Promise<string> {
  return inquirer.prompt({
    name: 'issue',
    message: 'Please enter the issue key:',
    validate: validateIssueKey,
    filter: filterIssueKey,
  }).then(({ issue }) => issue as string);
}

// eslint-disable-next-line import/prefer-default-export
export async function getIssueFromContext(input?: string): Promise<string> {
  if (input !== undefined) {
    const result = validateIssueKey(input);

    if (result === true) {
      return filterIssueKey(input);
    }

    throw result;
  }

  return getIssueFromGitBranch() || getIssueFromInput();
}
