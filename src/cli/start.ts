import inquirer from 'inquirer'
import Command from './command'
import { exec } from './shell'
import watson from './watson'

function getIssueFromGitBranch(): string | null {
  const command = 'git branch | grep "^*" | egrep -o "[A-Z]+-[0-9]+"'
  const issues = exec(command, { ignoreErrors: true }).trim().split('\n')

  return issues.length === 1 ? issues[0] : null
}

async function getIssueFromInput(): Promise<string> {
  return await inquirer.prompt({
    name: 'issue',
    message: 'Please enter the issue key:',
    validate: (input: string) => {
      const message = 'The issue key format is not valid.'
      return /^[A-Za-z]+-[0-9]+$/.test(input) || message
    },
    filter: (input: string) => input.toUpperCase(),
  }).then(({ issue }) => issue as string)
}

export default class Start extends Command {
  async run(): Promise<void> {
    const issue = getIssueFromGitBranch() || (await getIssueFromInput())

    try {
      watson.start(issue)
    } catch (e) {
      console.error('Please verify that `watson` is installed.')
    }
  }
}
