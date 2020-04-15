export default interface JiraSettingsProvider {
  getJiraBaseUrl(): string;
  getJiraUsername(): string;
  getJiraPassword(): string;
  getTempoBaseUrl(): string;
  getTempoApiToken(): string;
}
