export type DataId = string;

export type WithId<T> = T & { id: DataId };

export interface IStore {
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  createWithoutId: <T>(data: T) => Promise<WithId<T>>;
  read: <T>(id: DataId) => Promise<WithId<T>>;
  readAll: <T>() => Promise<WithId<T>[]>;
  update: <T>(data: WithId<T>) => Promise<void>;
  delete: (id: DataId) => Promise<void>;
}
