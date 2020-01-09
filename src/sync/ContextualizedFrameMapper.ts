import ContextualizedFrame from './ContextualizedFrame';
import Worklog from './Worklog';

export default interface ContextualizedFrameMapper {
  mapContextualizedFrames(frames: ContextualizedFrame[]): Promise<Worklog[]>;
}
