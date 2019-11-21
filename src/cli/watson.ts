import { spawn } from './shell';

export function start(project: string): void {
  spawn('watson', ['stop'], { silent: true });
  spawn('watson', ['start', project]);
}

export function stop(): void {
  spawn('watson', ['stop']);
}

export function cancel(): void {
  spawn('watson', ['cancel']);
}

export function showInstallationHelp(): void {
  console.error('Please make sure Watson is installed.\n\nTo install Watson, run `brew install watson` or `pip install td-watson`');
}
