import { Arguments, CommandModule } from 'yargs';
import FrameRepository from '../tracking/FrameRepository';
import Output from '../io/Output';
import chalk from 'chalk';

export default class RemoveCommand implements CommandModule {
  constructor(
    private frameRepository: FrameRepository,
    private output: Output,
  ) {}

  readonly command = 'remove [id]';

  readonly aliases = 'rm';

  readonly describe = 'Remove worklog by ID';

  readonly builder = {
    id: {
      describe: 'The worklog ID',
      type: 'string' as const,
      demand: true,
    },
  };

  readonly handler = async (args: Arguments<{ id?: string }>): Promise<void> => {
    const frame = await this.frameRepository.get(args.id as string);

    if (frame === null) {
      this.output.write('No such worklog.\n');

      return;
    }

    await this.frameRepository.delete([frame.id]);

    this.output.write(`Removed worklog ${chalk.gray(`[${frame.id}]`)}.\n`);
  };
}
