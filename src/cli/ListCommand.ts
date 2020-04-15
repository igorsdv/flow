import { CommandModule } from 'yargs';
import FrameRepository from '../tracking/FrameRepository';
import Output from '../io/Output';
import chalk from 'chalk';

export default class ListCommand implements CommandModule {
  constructor(
    private frameRepository: FrameRepository,
    private output: Output,
  ) {}

  readonly command = 'list';

  readonly aliases = 'ls';

  readonly describe = 'List stopped worklogs';

  readonly handler = async (): Promise<void> => {
    const frames = await this.frameRepository.getAllStopped();

    if (frames.length === 0) {
      this.output.write('There are no stopped worklogs.\n');
    } else {
      for (const frame of frames) {
        this.output.write(`${chalk.cyan(frame.project)} ${chalk.gray(`[${frame.id}]`)}\n`);
        this.output.write(`  Started ${chalk.green(frame.start.toLocaleString())}\n`);
        this.output.write(`  Stopped ${chalk.green(frame.end.toLocaleString())}\n`);
      }
    }
  };
}
