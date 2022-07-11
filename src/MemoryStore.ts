import { randomFill } from 'crypto';
import { promisify } from 'util';
import { DataId, IStore, WithId } from './IStore';

const randomFillPromise = promisify<Buffer, Buffer>(randomFill);

export class MemoryStore implements IStore {
  private readonly database: Record<DataId, WithId<any>>;

  constructor() {
    this.database = {};
  }

  async connect() {
    // NOP
  }

  async disconnect() {
    // NOP
  }

  /**
   * @deprecated use {@link createWithoutId} instead.
   */
  async create<T>(data: WithId<T>) {
    this.database[data.id] = data;
    return data;
  }

  async createWithoutId<T>(data: T): Promise<WithId<T>> {
    const buffer = Buffer.alloc(12);
    const result = await randomFillPromise(buffer);
    const id = result.toString('hex');
    const save: WithId<T> = { ...data, id };
    this.database[id] = save;
    return { ...data, id };
  }

  async read<T>(id: DataId): Promise<WithId<T>> {
    const found = this.database[id];
    if (!found) {
      throw new Error('Could not find data by id');
    }
    return found as unknown as WithId<T>;
  }

  async readAll<T>(): Promise<WithId<T>[]> {
    const found = Object.keys(this.database).map((key) => this.database[key]);
    return found as unknown as WithId<T>[];
  }

  async update<T>(data: WithId<T>) {
    this.database[data.id] = data;
  }

  async delete(id: DataId) {
    if (!this.database[id]) throw new Error('Could not delete non-existant data');
    delete this.database[id];
  }
}
