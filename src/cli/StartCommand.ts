import { Arguments, CommandModule } from 'yargs';
import FrameController from '../tracking/FrameController';
import Input from '../io/Input';
import Output from '../io/Output';
import ProjectContext from './ProjectContext';
import chalk from 'chalk';

export default class StartCommand implements CommandModule {
  constructor(
    private projectContext: ProjectContext,
    private frameController: FrameController,
    private input: Input,
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
    const issue = args.issue && args.issue.toUpperCase()
      || await this.projectContext.getProject()
      || await this.input.prompt({
        message: 'Please enter the issue key:',
        filter: (input) => input.toUpperCase(),
      });

    const frame = await this.frameController.start(issue, ({ project }) => {
      this.output.write(`Stopped work on project ${chalk.cyan(project)}.\n`);
    });

    this.output.write(`Started work on project ${chalk.cyan(frame.project)}.\n`);
  };
}
