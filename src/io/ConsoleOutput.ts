import Output from './Output';

export default class ConsoleOutput implements Output {
  write(message: string): void {
    process.stdout.write(message);
  }
}
