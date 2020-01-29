import levelup, { LevelUp } from 'levelup';
import leveldown from 'leveldown';
import stream from 'stream';
import util from 'util';

const finished = util.promisify(stream.finished);

export default class LevelDb {
  private db: LevelUp;

  constructor(path: string) {
    this.db = levelup(leveldown(path));
  }

  async get(key: string): Promise<string | null> {
    try {
      return (await this.db.get(key)).toString();
    } catch (e) {
      if (e.notFound) {
        return null;
      }

      throw e;
    }
  }

  async getAll(): Promise<[string, string][]> {
    const result: [string, string][] = [];
    const rs = this.db.createReadStream().on('data', ({ key, value }) => {
      result.push([key, value]);
    });

    await finished(rs);

    return result;
  }

  async put(key: string, value: string): Promise<void> {
    return this.db.put(key, value);
  }

  async deleteBatch(keys: string[]): Promise<void> {
    const ops = keys.map((key) => ({ type: 'del' as const, key }));

    return this.db.batch(ops);
  }
}
