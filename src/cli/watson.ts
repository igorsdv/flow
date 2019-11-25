import moment from 'moment';
import { spawn } from './shell';

const PENDING_TAG = 'flow.pending';
const PUSHED_TAG = 'flow.pushed';

export function start(project: string): void {
  spawn('watson', ['start', project, `+${PENDING_TAG}`]);
}

export function stop(options?: { silent: true | false | 'error' }): void {
  spawn('watson', ['stop'], { silent: options && options.silent });
}

export function cancel(): void {
  spawn('watson', ['cancel']);
}

export function status(): void {
  spawn('watson', ['status']);
}

export function log(): void {
  spawn('watson', ['log', '--current', '--all', '--no-pager', '--tag', PENDING_TAG]);
}

export interface Frame {
  id: string;
  project: string;
  start: moment.Moment;
  stop: moment.Moment;
}

export function getPendingFrames(): Frame[] {
  const { stdout } = spawn('watson', ['log', '--all', '--json', '--tag', PENDING_TAG], { silent: true });

  return JSON.parse(stdout).map(({ id, project, start, stop }: {
    id: string;
    project: string;
    start: string;
    stop: string;
  }) => ({ id, project, start: moment(start), stop: moment(stop) }));
}

export function renamePendingTag(): void {
  spawn('watson', ['rename', 'tag', PENDING_TAG, PUSHED_TAG]);
}

export function showInstallationHelp(): void {
  console.error('Please make sure Watson is installed.\n\nTo install Watson, run `brew install watson` or `pip install td-watson`');
}
