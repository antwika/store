import { Data, DataId, IStore } from './IStore';

export class MemoryStore implements IStore {
  private readonly database: Record<DataId, Data>;

  constructor() {
    this.database = {};
  }

  async connect() {
    // NOP
  }

  async disconnect() {
    // NOP
  }

  async create<T extends Data>(data: T) {
    this.database[data.id] = data;
    return data;
  }

  async read<T extends Data>(id: DataId): Promise<T> {
    const found = this.database[id];
    if (!found) {
      throw new Error('Could not find data by id');
    }
    return found as unknown as T;
  }

  async readAll<T extends Data>(): Promise<T[]> {
    const found = Object.keys(this.database).map((key) => this.database[key]);
    return found as unknown as T[];
  }

  async update<T extends Data>(data: T) {
    this.database[data.id] = data;
  }

  async delete(id: DataId) {
    if (!this.database[id]) throw new Error('Could not delete non-existant data');
    delete this.database[id];
  }
}
