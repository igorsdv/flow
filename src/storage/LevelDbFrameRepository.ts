import Frame from '../tracking/Frame';
import FrameRepository from '../tracking/FrameRepository';
import LevelDb from './LevelDb';
import PendingFrame from '../tracking/PendingFrame';
import StorageSettingsProvider from './StorageSettingsProvider';
import moment from 'moment';

const CURRENT_FRAME_KEY = 'current-frame';
const FRAME_KEY_PREFIX = 'frame-';

interface SerializedFrame {
  id: string;
  project: string;
  start: string;
  end: string | null;
}

export default class LevelDbFrameRepository implements FrameRepository {
  private db: LevelDb;

  constructor(settingsProvider: StorageSettingsProvider) {
    this.db = new LevelDb(settingsProvider.getLevelDbPath());
  }

  async getCurrent(): Promise<PendingFrame | null> {
    const key = await this.db.get(CURRENT_FRAME_KEY);

    if (key == null) {
      return null;
    }

    const frame: SerializedFrame = JSON.parse(await this.db.get(key) as string);

    return PendingFrame.create({
      project: frame.project,
      start: moment(frame.start, moment.ISO_8601),
    }, frame.id).getOrThrow();
  }

  async getAllStopped(): Promise<Frame[]> {
    const frames = [];

    for (const [key, value] of await this.db.getAll()) {
      if (key.startsWith(FRAME_KEY_PREFIX)) {
        const frame: SerializedFrame = JSON.parse(value);

        if (frame.end !== null) {
          frames.push(Frame.create({
            project: frame.project,
            start: moment(frame.start, moment.ISO_8601),
            end: moment(frame.end as string, moment.ISO_8601),
          }, frame.id).getOrThrow());
        }
      }
    }

    return frames;
  }

  async save(frame: Frame | PendingFrame): Promise<void> {
    const serializedFrame: SerializedFrame = {
      id: frame.id,
      project: frame.project,
      start: frame.start.toISOString(true),
      end: frame instanceof Frame ? frame.end.toISOString(true) : null,
    };

    const key = FRAME_KEY_PREFIX + frame.id;
    const value = JSON.stringify(serializedFrame);

    if (frame instanceof Frame) {
      const currentKey = await this.db.get(CURRENT_FRAME_KEY);

      if (currentKey === key) {
        return this.stopCurrentFrame(key, value);
      }

      return this.db.put(key, value);
    }

    return this.startCurrentFrame(key, value);
  }

  private async startCurrentFrame(key: string, value: string): Promise<void> {
    return this.db.batch([{
      type: 'put' as const,
      key: CURRENT_FRAME_KEY,
      value: key,
    }, {
      type: 'put' as const,
      key,
      value,
    }]);
  }

  private async stopCurrentFrame(key: string, value: string): Promise<void> {
    return this.db.batch([{
      type: 'del' as const,
      key: CURRENT_FRAME_KEY,
    }, {
      type: 'put' as const,
      key,
      value,
    }]);
  }

  async delete(ids: string[]): Promise<void> {
    return this.db.deleteBatch(ids.map((id) => FRAME_KEY_PREFIX + id));
  }
}
