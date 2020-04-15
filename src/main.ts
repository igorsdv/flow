import yargs, { Arguments } from 'yargs';
import chalk from 'chalk';
import cli from './cli';

for (const command of Object.values(cli)) {
  yargs.command(command);
}

yargs
  .option('verbose', {
    alias: 'v',
    describe: 'Show debug output on error',
    type: 'boolean',
  })
  .help()
  .alias('help', 'h')
  .strict()
  .demandCommand()
  .recommendCommands()
  .fail((msg, err) => {
    if (err) {
      let output = err.message;

      if (yargs.parsed
        && (yargs.parsed.argv as Arguments<{ verbose: boolean }>).verbose
        && err.stack) {
        output = err.stack;
      }

      process.stderr.write(`${chalk.red(output)}\n`);
    } else {
      yargs.showHelp();
    }
  })
  .parse();
