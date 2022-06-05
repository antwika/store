export type DataId = string;

export type Data = {
  id: DataId,
};

export interface IStore {
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  create: <T extends Data>(data: T) => Promise<T>;
  read: <T extends Data>(id: DataId) => Promise<T>;
  readAll: <T extends Data>() => Promise<T[]>;
  update: <T extends Data>(data: T) => Promise<void>;
  delete: (id: DataId) => Promise<void>;
}
