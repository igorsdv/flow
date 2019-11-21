import yargs from 'yargs';
import * as commands from './cli/commands';

export default function (): void {
  const argv = yargs
    .command(
      'start [issue]',
      'Start work log (default command)',
      (yargs) => {
        yargs
          .positional('issue', {
            describe: 'The issue key in ABSO-1 format',
            type: 'string',
          })
          .usage(
            '$0 start [issue]\n\nStart work log\n\nWhen no issue is specified, it is determined based on the current Git branch.',
          );
      },
      commands.start,
    )
    .command('stop', 'Stop work log', () => {}, commands.stop)
    .command('cancel', 'Delete active work log', () => {}, commands.cancel)
    .command('setup', 'Set up API credentials', () => {}, commands.setup)
    .strict()
    .help()
    .alias('h', 'help')
    .example('$0', 'Start work log for the issue determined by the current Git branch')
    .example('$0 start ABSO-1', 'Start work log for ABSO-1')
    .recommendCommands()
    .completion('completion', 'Generate shell completion script')
    .wrap(90)
    .parse();

  if (argv._.length === 0) {
    commands.start(argv);
  }
}
