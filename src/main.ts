import yargs from 'yargs';
import * as commands from './cli/commands';

export default function (): void {
  const argv = yargs
    .command('cancel', 'Delete the active tracking timer (undo the start command)', () => {}, commands.cancel)
    .completion('completion', 'Generate shell completion script')
    .command('push', 'TODO', commands.push)
    .command('setup', 'Set up API credentials', () => {}, commands.setup)
    .command(
      'start [issue]',
      'Start tracking time for a given issue (default command)',
      (yargs) => {
        yargs
          .positional('issue', {
            describe: 'The issue key in ABSO-1 format',
            type: 'string',
          })
          .option('no-interaction', {
            alias: 'n',
            default: false,
            type: 'boolean',
          })
          .usage(
            '$0 start [issue]\n\nStart tracking time for a given issue\n\nWhen no issue is specified, it is determined based on the current Git branch.',
          );
      },
      commands.start,
    )
    // .command('status)
    .command('stop', 'Stop tracking time', () => {}, commands.stop)
    .strict()
    .help()
    .alias('help', 'h')
    .example('$0', 'Start tracking time, prompting for the issue key')
    .example('$0 start -n', 'Start tracking time for the issue determined by the current Git branch')
    .example('$0 start --help', 'Get detailed usage information for a command') 
    .recommendCommands()
    // .wrap(90)
    .parse();

  if (argv._.length === 0) {
    commands.start({ noInteraction: false, ...argv });
  }
}
