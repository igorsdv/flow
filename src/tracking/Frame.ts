import TimeRange from './TimeRange';
import Entity from '../core/Entity';

interface FrameProps {
  project: string;
  range: TimeRange;
}

export default class Frame extends Entity<FrameProps> {
  static create(props: FrameProps, id?: string): Frame {
    return new Frame(props, id);
  }

  get project(): string {
    return this.props.project;
  }
}
