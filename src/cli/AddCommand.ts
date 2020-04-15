import { Arguments, CommandModule } from 'yargs';
import Frame from '../tracking/Frame';
import FrameRepository from '../tracking/FrameRepository';
import Output from '../io/Output';
import chalk from 'chalk';
import moment from 'moment';

export default class AddCommand implements CommandModule {
  constructor(
    private frameRepository: FrameRepository,
    private output: Output,
  ) {}

  readonly command = 'add [issue] [duration]';

  readonly describe = 'Add worklog by duration';

  readonly builder = {
    issue: {
      describe: 'The issue in ABSO-1 format',
      type: 'string' as const,
      demand: true,
    },
    duration: {
      describe: 'The worklog duration in hours',
      type: 'number' as const,
      demand: true,
    },
  };

  readonly handler = async (
    { issue, duration }: Arguments<{ issue?: string; duration?: number }>,
  ): Promise<void> => {
    const frame = Frame.create({
      project: issue as string,
      start: moment(),
      end: moment().add(duration, 'hours'),
    }).getOrThrow();

    await this.frameRepository.save(frame);

    this.output.write(`Added worklog for ${chalk.cyan(frame.project)}.\n`);
  };
}
