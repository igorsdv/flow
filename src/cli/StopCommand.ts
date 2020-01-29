import { CommandModule } from 'yargs';
import FrameController from '../tracking/FrameController';
import Output from '../io/Output';

export default class StopCommand implements CommandModule {
  constructor(
    private frameController: FrameController,
    private output: Output,
  ) {}

  readonly command = 'stop';

  readonly describe = 'Stop tracking work';

  readonly handler = async (): Promise<void> => {
    const frame = await this.frameController.stop();

    if (frame === null) {
      this.output.write('There is no pending work.\n');
    } else {
      this.output.write(`Stopped work on issue ${frame.project}.\n`);
    }
  };
}
