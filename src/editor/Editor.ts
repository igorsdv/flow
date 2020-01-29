import ContextualizedFrame from '../sync/ContextualizedFrame';
import ContextualizedFrameMapper from '../sync/ContextualizedFrameMapper';
import Input from '../io/Input';
import Output from '../io/Output';
import Parser from './Parser';
import Renderer from './Renderer';
import Worklog from '../sync/Worklog';
import { edit } from 'external-editor';

function groupByDate(frames: ContextualizedFrame[]): Map<string, ContextualizedFrame[]> {
  const map = new Map<string, ContextualizedFrame[]>();

  for (const frame of frames) {
    const date = frame.start.format('YYYY-MM-DD');

    if (!map.has(date)) {
      map.set(date, []);
    }

    (map.get(date) as ContextualizedFrame[]).push(frame);
  }

  return map;
}

export default class Editor implements ContextualizedFrameMapper {
  constructor(private input: Input, private output: Output) {}

  async mapContextualizedFrames(frames: ContextualizedFrame[]): Promise<Worklog[]> {
    let text = Renderer.renderFrames(groupByDate(frames));

    while (true) { // eslint-disable-line no-constant-condition
      this.output.write('\n');
      this.output.write('Waiting for the editor to close the file...');

      text = edit(text, { postfix: '.yml' });

      this.output.write('\r');

      try {
        return Parser.parseWorklogs(text).getOrThrow();
      } catch (e) {
        this.output.write(`Validation failed: ${e.message}\n`);
      }

      // eslint-disable-next-line no-await-in-loop
      if (!await this.input.confirm('Open for editing again?')) {
        throw new Error('Push aborted');
      }
    }
  }
}
