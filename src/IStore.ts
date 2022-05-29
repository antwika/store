export type DataId = string;

export type Data = {
  id: DataId,
};

export interface IStore {
  disconnect: () => Promise<void>;
  get: (id: DataId) => Promise<any>;
  write: (data: Data) => Promise<any>;
  delete: (id: DataId) => Promise<any>;
}
