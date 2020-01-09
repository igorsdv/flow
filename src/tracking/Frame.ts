import moment, { Duration, Moment } from 'moment';
import Entity from '../core/Entity';
import Result from '../core/Result';

interface FrameProps {
  project: string;
  start: Moment;
  end: Moment;
}

export default class Frame extends Entity<FrameProps> {
  static create(props: FrameProps, id?: string): Result<Frame> {
    const project = props.project.toUpperCase();

    if (project.length === 0) {
      return Result.err(new Error('The project name is required.'));
    }

    if (props.start > props.end) {
      return Result.err(new Error('The time range is invalid.'));
    }

    return Result.ok(new Frame({ project, ...props }, id));
  }

  get project(): string {
    return this.props.project;
  }

  get start(): Moment {
    return this.props.start;
  }

  get end(): Moment {
    return this.props.end;
  }

  duration(): Duration {
    return moment.duration({ from: this.start, to: this.end });
  }
}
