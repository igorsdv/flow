import Frame from './Frame';
import PendingFrame from './PendingFrame';

export default interface FrameRepository {
  get(id: string): Promise<Frame | null>;
  getCurrent(): Promise<PendingFrame | null>;
  getAllStopped(): Promise<Frame[]>;
  save(frame: PendingFrame | Frame): Promise<void>;
  delete(ids: string[]): Promise<void>;
}
