import AddCommand from './AddCommand';
import CancelCommand from './CancelCommand';
import ConsoleOutput from '../io/ConsoleOutput';
import FrameController from '../tracking/FrameController';
import FrameMapper from '../sync/FrameMapper';
import GitProjectContext from './GitProjectContext';
import InquirerInput from '../io/InquirerInput';
import ListCommand from './ListCommand';
import PushCommand from './PushCommand';
import RemoveCommand from './RemoveCommand';
import StartCommand from './StartCommand';
import StatusCommand from './StatusCommand';
import StopCommand from './StopCommand';
import editor from '../editor';
import jira from '../jira';
import storage from '../storage';

const input = new InquirerInput();
const output = new ConsoleOutput();
const projectContext = new GitProjectContext();
const frameController = new FrameController(storage.frameRepository);
const frameMapper = new FrameMapper(
  jira.synchronizer,
  editor.contextualizedFrameMapper,
  input,
  output,
);

export default {
  startCommand: new StartCommand(projectContext, frameController, input, output),
  stopCommand: new StopCommand(frameController, output),
  cancelCommand: new CancelCommand(frameController, storage.frameRepository, output),
  statusCommand: new StatusCommand(storage.frameRepository, output),
  listCommand: new ListCommand(storage.frameRepository, output),
  addCommand: new AddCommand(storage.frameRepository, output),
  removeCommand: new RemoveCommand(storage.frameRepository, output),
  pushCommand: new PushCommand(
    storage.frameRepository, frameMapper, jira.synchronizer, input, output,
  ),
};
