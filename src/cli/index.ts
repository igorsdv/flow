import ConsoleOutput from '../io/ConsoleOutput';
import FrameController from '../tracking/FrameController';
import GitProjectContext from './GitProjectContext';
import StartCommand from './StartCommand';
import StatusCommand from './StatusCommand';
import StopCommand from './StopCommand';
import storage from '../storage';

const projectContext = new GitProjectContext();
const frameController = new FrameController(storage.frameRepository);
const output = new ConsoleOutput();

export default {
  startCommand: new StartCommand(projectContext, frameController, output),
  stopCommand: new StopCommand(frameController, output),
  statusCommand: new StatusCommand(storage.frameRepository, output),
};
