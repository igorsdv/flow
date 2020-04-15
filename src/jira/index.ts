import JiraClient from './client/JiraClient';
import JiraSynchronizer from './JiraSynchronizer';
import SettingsProvider from '../settings/SettingsProvider';
import TempoClient from './client/TempoClient';
import axios from 'axios';

const settingsProvider = new SettingsProvider();
const jiraClient = new JiraClient(settingsProvider, axios);
const tempoClient = new TempoClient(settingsProvider, axios);

export default {
  synchronizer: new JiraSynchronizer(jiraClient, tempoClient),
};
