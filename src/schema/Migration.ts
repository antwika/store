import { IStore } from '../IStore';

export type Migration = {
  name: string,
  timestamp: string,
  up: (store: IStore) => Promise<void>;
  down: (store: IStore) => Promise<void>;
};
