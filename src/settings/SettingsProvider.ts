import JiraSettingsProvider from '../jira/JiraSettingsProvider';
import StorageSettingsProvider from '../storage/StorageSettingsProvider';
import dotenv from 'dotenv';

dotenv.config();

function getFromEnvironment(variable: string): string {
  const value = process.env[variable];

  if (typeof value === 'undefined') {
    throw new Error(`Failed to read configuration value ${variable}`);
  }

  return value;
}

export default class SettingsProvider implements JiraSettingsProvider, StorageSettingsProvider {
  getJiraBaseUrl(): string {
    return getFromEnvironment('JIRA_URL');
  }

  getJiraUsername(): string {
    return getFromEnvironment('JIRA_EMAIL');
  }

  getJiraPassword(): string {
    return getFromEnvironment('JIRA_TOKEN');
  }

  getTempoBaseUrl(): string {
    return getFromEnvironment('TEMPO_URL');
  }

  getTempoApiToken(): string {
    return getFromEnvironment('TEMPO_TOKEN');
  }

  getLevelDbPath(): string {
    return getFromEnvironment('DB_PATH');
  }
}
