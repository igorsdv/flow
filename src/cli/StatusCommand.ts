import { CommandModule } from 'yargs';
import FrameRepository from '../tracking/FrameRepository';
import Output from '../io/Output';

export default class StatusCommand implements CommandModule {
  constructor(
    private frameRepository: FrameRepository,
    private output: Output,
  ) {}

  readonly command = 'status';

  readonly describe = 'Show current status';

  readonly handler = async (): Promise<void> => {
    const frame = await this.frameRepository.getCurrent();

    if (frame === null) {
      this.output.write('There is no pending work.\n');
    } else {
      this.output.write(`Project ${frame.project} started at ${frame.start.toLocaleString()}.\n`);
    }
  };
}
