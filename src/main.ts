import cli from './cli';
import yargs from 'yargs';

for (const command of Object.values(cli)) {
  yargs.command(command);
}

yargs.parse();
