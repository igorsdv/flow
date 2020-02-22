import ConsoleOutput from '../io/ConsoleOutput';
import FrameController from '../tracking/FrameController';
import GitProjectContext from './GitProjectContext';
import InquirerInput from '../io/InquirerInput';
import StartCommand from './StartCommand';
import StatusCommand from './StatusCommand';
import StopCommand from './StopCommand';
import storage from '../storage';

const projectContext = new GitProjectContext();
const frameController = new FrameController(storage.frameRepository);
const input = new InquirerInput();
const output = new ConsoleOutput();

export default {
  startCommand: new StartCommand(projectContext, frameController, input, output),
  stopCommand: new StopCommand(frameController, output),
  statusCommand: new StatusCommand(storage.frameRepository, output),
};
