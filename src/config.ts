import fs from 'fs';
import inquirer from 'inquirer';
import os from 'os';
import path from 'path';

export interface Config {
  email: string;
  jiraApiToken: string;
  tempoApiToken: string;
}

function getConfigDirectoryPath(): string {
  const intermediatePath = os.platform() === 'darwin' ? 'Library/Application Support' : '.config';

  return path.resolve(os.homedir(), intermediatePath, 'flow');
}

function getConfigFilePath(): string {
  return path.resolve(getConfigDirectoryPath(), 'config.json');
}

export function load(): Config {
  const data = fs.readFileSync(getConfigFilePath(), { encoding: 'utf-8' });

  return JSON.parse(data) as Config;
}

function save(config: Config): void {
  try {
    fs.mkdirSync(getConfigDirectoryPath(), { recursive: true });
  } catch (e) {
    if (e.code !== 'EEXIST') {
      throw e;
    }
  }

  fs.writeFileSync(getConfigFilePath(), `${JSON.stringify(config, null, 2)}\n`, { mode: 0o600 });
}

export async function setup(): Promise<void> {
  console.log('Create a JIRA API token here: https://id.atlassian.com/manage/api-tokens');
  console.log('Create a Tempo API token here: https://absolunet.jira.com/plugins/servlet/ac/io.tempo.jira/tempo-configuration');
  console.log('');

  return inquirer.prompt<Config>([
    {
      name: 'email',
      message: 'Please enter your email:',
    },
    {
      name: 'jiraApiToken',
      message: 'Please enter your JIRA API token:',
    },
    {
      name: 'tempoApiToken',
      message: 'Please enter your Tempo API token:',
    },
  ]).then((config) => {
    save(config);
    console.log('Configuration was saved.');
  });
}
