export type DataId = string;

/**
 * @deprecated use {@link WithId} instead
 * @example `async fn<T extends Data>(data: T)` becomes `async fn<T>(data: WithId<T>)`
 */
export type Data = {
  id: DataId,
};

export type WithId<T> = T & { id: DataId };

export interface IStore {
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  /**
   * @deprecated use {@link IStore.createWithoutId} instead.
   */
  create: <T>(data: WithId<T>) => Promise<WithId<T>>;
  createWithoutId: <T>(data: T) => Promise<WithId<T>>;
  read: <T>(id: DataId) => Promise<WithId<T>>;
  readAll: <T>() => Promise<WithId<T>[]>;
  update: <T>(data: WithId<T>) => Promise<void>;
  delete: (id: DataId) => Promise<void>;
}
