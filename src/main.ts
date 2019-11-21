import yargs from 'yargs';
import * as commands from './cli/commands';

export default function (): void {
  const argv = yargs
    .command(
      'start [issue]',
      'Start work log',
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
    .command('cancel', 'Cancel work log', () => {}, commands.cancel)
    .strict()
    .help()
    .alias('h', 'help')
    .example('$0', 'Start work log for the issue determined by the current Git branch')
    .example('$0 start ABSO-1', 'Start work log for ABSO-1')
    .recommendCommands()
    .wrap(90)
    .parse();

  if (argv._.length === 0) {
    commands.start(argv);
  }
}
