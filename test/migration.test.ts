/* eslint-disable no-lone-blocks */
import { IStore, WithId } from '../src/IStore';
import { MemoryStore } from '../src/MemoryStore';
import { migrationV2 } from './migrations/migrationV2';
import { migrationV3 } from './migrations/migrationV3';
import { Migrator } from '../src/Migrator';
import { UserV1, UserV3 } from '../src/schema/User';

describe('migration', () => {
  let store: IStore;

  beforeAll(async () => {
    store = new MemoryStore();
    await store.connect();
  });

  afterAll(async () => {
    await store.disconnect();
  });

  // eslint-disable-next-line jest/expect-expect
  it('migrates.', async () => {
    const userV1: UserV1 = { firstname: 'Anna', lastname: 'Andersson' };

    const user = await store.createWithoutId(userV1);

    const migrator = new Migrator();

    await migrator.upgrade(store, [
      migrationV2,
      migrationV3,
    ]);

    {
      const found: WithId<UserV3> = await store.read(user.id);
      expect(found).toStrictEqual({
        id: expect.any(String),
        firstname: 'Anna',
        lastname: 'Andersson',
        fullname: 'Anna Andersson',
        shortname: 'AnnAnd',
      });
    }

    await migrator.downgrade(store, [
      migrationV2,
      migrationV3,
    ]);

    {
      const found: WithId<UserV1> = await store.read(user.id);
      expect(found).toStrictEqual({
        id: expect.any(String),
        firstname: 'Anna',
        lastname: 'Andersson',
      });
    }
  });
});
