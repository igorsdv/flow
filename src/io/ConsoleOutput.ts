import Output from './Output';

export default class ConsoleOutput implements Output {
  write(message: string): void {
    process.stdout.write(message);
  }

  clearLine(): void {
    process.stdout.write(`\r${''.padEnd(process.stdout.columns, ' ')}\r`);
  }
}
