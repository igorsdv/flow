import Frame from './Frame';

export default interface FrameRepository {
  get(id: string): Promise<Frame>;
  getAll(): Promise<Frame[]>;
  save(frame: Frame): Promise<void>;
  delete(id: string): Promise<void>;
}
