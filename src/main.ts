import yargs from 'yargs';
import * as commands from './cli/commands';

export default function (): void {
  const argv = yargs
    .command('start [issue]', 'Start work log', () => {}, commands.start)
    .command('stop', 'Stop work log', () => {}, commands.stop)
    .command('cancel', 'Cancel work log', () => {}, commands.cancel)
    .strict()
    .help()
    .alias('h', 'help')
    .recommendCommands()
    .parse();

  if (argv._.length === 0) {
    commands.start(argv);
  }
}
