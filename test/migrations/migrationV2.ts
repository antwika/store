import { IStore } from '../../src/IStore';
import { Migration } from '../../src/schema/Migration';
import { UserV1, UserV2 } from '../../src/schema/User';

export const migrationV2: Migration = {
  name: 'add "fullname".',
  timestamp: new Date('2000-01-01').toISOString(),
  up: async (store: IStore) => {
    const users = await store.readAll<UserV1>();
    for (const user of users) {
      const userV2 = {
        ...user,
        fullname: `${user.firstname} ${user.lastname}`,
      };
      // eslint-disable-next-line no-await-in-loop
      await store.update<UserV2>(userV2);
    }
  },
  down: async (store: IStore) => {
    const users = await store.readAll<UserV2>();
    for (const user of users) {
      // eslint-disable-next-line no-await-in-loop
      await store.replace<UserV1>({
        id: user.id,
        firstname: user.firstname,
        lastname: user.lastname,
      });
    }
  },
};
