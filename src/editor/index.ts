import ConsoleOutput from '../io/ConsoleOutput';
import Editor from './Editor';
import InquirerInput from '../io/InquirerInput';

const input = new InquirerInput();
const output = new ConsoleOutput();

export default {
  contextualizedFrameMapper: new Editor(input, output),
};
