import LevelDbFrameRepository from './LevelDbFrameRepository';
import SettingsProvider from '../settings/SettingsProvider';

const settingsProvider = new SettingsProvider();

export default {
  frameRepository: new LevelDbFrameRepository(settingsProvider),
};
