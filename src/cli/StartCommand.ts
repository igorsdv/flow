import { Arguments, CommandModule } from 'yargs';
import FrameController from '../tracking/FrameController';
import Output from '../io/Output';
import ProjectContext from './ProjectContext';

export default class StartCommand implements CommandModule {
  constructor(
    private projectContext: ProjectContext,
    private frameController: FrameController,
    private output: Output,
  ) {}

  readonly command = 'start [issue]';

  readonly describe = 'Start tracking work';

  readonly builder = {
    issue: {
      describe: 'The issue in ABSO-1 format',
      type: 'string' as const,
    },
  };

  readonly handler = async (args: Arguments<{ issue?: string }>): Promise<void> => {
    const issue = args.issue || await this.projectContext.getProject();

    if (issue === null) {
      throw new Error('No issue provided.');
    }

    const frame = await this.frameController.start(issue, ({ project }) => {
      this.output.write(`Stopped work on issue ${project}.\n`);
    });

    this.output.write(`Started work on issue ${frame.project}.\n`);
  };
}
