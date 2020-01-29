import moment, { Moment } from 'moment';
import Entity from '../core/Entity';
import Frame from './Frame';
import Result from '../core/Result';

interface PendingFrameProps {
  project: string;
  start: Moment;
}

export default class PendingFrame extends Entity<PendingFrameProps> {
  static create(props: PendingFrameProps, id?: string): Result<PendingFrame> {
    const project = props.project.toUpperCase();

    if (project.length === 0) {
      return Result.err(new Error('The project name is required.'));
    }

    return Result.ok(new PendingFrame({ project, ...props }, id));
  }

  get project(): string {
    return this.props.project;
  }

  get start(): Moment {
    return this.props.start;
  }

  complete(): Result<Frame> {
    return Frame.create({ end: moment(), ...this.props });
  }
}
