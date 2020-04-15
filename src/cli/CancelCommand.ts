import { CommandModule } from 'yargs';
import FrameController from '../tracking/FrameController';
import FrameRepository from '../tracking/FrameRepository';
import Output from '../io/Output';
import chalk from 'chalk';

export default class CancelCommand implements CommandModule {
  constructor(
    private frameController: FrameController,
    private frameRepository: FrameRepository,
    private output: Output,
  ) {}

  readonly command = 'cancel';

  readonly describe = 'Cancel ongoing worklog';

  readonly handler = async (): Promise<void> => {
    const frame = await this.frameRepository.getCurrent();

    if (frame === null) {
      this.output.write('There is no pending work.\n');

      return;
    }

    await this.frameController.stop();
    await this.frameRepository.delete([frame.id]);

    this.output.write(`Removed pending worklog for ${chalk.cyan(`${frame.project}`)}.\n`);
  };
}
