import { randomFill } from 'crypto';
import { promisify } from 'util';
import { IPartitionStore, Partition, PartitionName } from './IPartitionStore';
import { DataId, WithId } from './IStore';

const randomFillPromise = promisify<Buffer, Buffer>(randomFill);

export class MemoryPartitionStore implements IPartitionStore {
  private readonly database: Record<PartitionName, Record<DataId, WithId<any>>>;

  constructor() {
    this.database = {};
  }

  async connect() {
    // NOP
  }

  async disconnect() {
    // NOP
  }

  async createWithoutId<T>(partition: Partition, data: T): Promise<WithId<T>> {
    const buffer = Buffer.alloc(12);
    const result = await randomFillPromise(buffer);
    const id = result.toString('hex');
    const save: WithId<T> = { ...data, id };

    if (!this.database[partition.name]) {
      this.database[partition.name] = {};
    }

    this.database[partition.name][id] = save;
    return { ...data, id };
  }

  async read<T>(partition: Partition, id: DataId): Promise<WithId<T>> {
    if (!this.database[partition.name]) {
      throw new Error('Partition does not exist in store');
    }

    const found = this.database[partition.name][id];
    if (!found) {
      throw new Error('Could not find data by id');
    }
    return found as unknown as WithId<T>;
  }

  async readAll<T>(partition: Partition): Promise<WithId<T>[]> {
    const part = this.database[partition.name];
    if (!part) {
      throw new Error('Partition does not exist in store');
    }

    const found = Object.keys(part).map((key) => part[key]);
    return found as unknown as WithId<T>[];
  }

  async update<T>(partition: Partition, data: WithId<T>) {
    if (!this.database[partition.name]) {
      throw new Error('Partition does not exist in store');
    }

    this.database[partition.name][data.id] = data;
  }

  async delete(partition: Partition, id: DataId) {
    if (!this.database[partition.name]) {
      throw new Error('Partition does not exist in store');
    }

    if (!this.database[partition.name][id]) throw new Error('Could not delete non-existant data');
    delete this.database[partition.name][id];
  }
}
