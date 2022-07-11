import { DataId, WithId } from './IStore';

export type PartitionName = string;

export type Partition = {
  name: PartitionName,
};

export interface IPartitionStore {
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  createWithoutId: <T>(partition: Partition, data: T) => Promise<WithId<T>>;
  read: <T>(partition: Partition, id: DataId) => Promise<WithId<T>>;
  readAll: <T>(partition: Partition) => Promise<WithId<T>[]>;
  update: <T>(partition: Partition, data: WithId<T>) => Promise<void>;
  delete: (partition: Partition, id: DataId) => Promise<void>;
}
