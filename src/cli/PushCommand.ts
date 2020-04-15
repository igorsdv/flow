import { CommandModule } from 'yargs';
import FrameMapper from '../sync/FrameMapper';
import FrameRepository from '../tracking/FrameRepository';
import Input from '../io/Input';
import NamedError from '../core/NamedError';
import Output from '../io/Output';
import Synchronizer from '../sync/Synchronizer';
import chalk from 'chalk';

export default class PushCommand implements CommandModule {
  constructor(
    private frameRepository: FrameRepository,
    private frameMapper: FrameMapper,
    private synchronizer: Synchronizer,
    private input: Input,
    private output: Output,
  ) {}

  readonly command = 'push';

  readonly describe = 'Push pending worklogs';

  readonly handler = async (): Promise<void> => {
    try {
      await this.doPush();
    } catch (e) {
      const error: Error = e;

      if (NamedError.isUserAbortError(error)) {
        this.output.write('Push aborted.\n');
      } else {
        throw e;
      }
    }
  };

  private doPush = async (): Promise<void> => {
    const frames = await this.frameRepository.getAllStopped();
    const worklogs = await this.frameMapper.mapFrames(frames);

    if (worklogs.length === 0) {
      this.output.write('Nothing to push.\n');

      return;
    }

    const results = await this.synchronizer.push(worklogs);

    let hasErrors = false;

    for (const [issueKey, errors] of results) {
      if (errors.length === 0) {
        this.output.write(`Push succeeded for ${issueKey}.\n`);
      } else {
        this.output.write(`${chalk.red(`Push failed for ${issueKey}.`)} The following error(s) occurred:\n`);

        for (const error of errors) {
          this.output.write(`  ${error.message}\n`);
        }

        hasErrors = true;
      }
    }

    if (!hasErrors || await this.input.confirm('Clean all stopped projects?')) {
      await this.frameRepository.delete(frames.map(({ id }) => id));
    }

    this.output.write('Push complete.\n');
  };
}
