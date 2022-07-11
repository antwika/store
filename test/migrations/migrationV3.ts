import { IStore } from '../../src/IStore';
import { Migration } from '../../src/schema/Migration';
import { UserV2, UserV3 } from '../../src/schema/User';

export const migrationV3: Migration = {
  name: 'add "shortname".',
  timestamp: new Date('2000-01-02').toISOString(),
  up: async (store: IStore) => {
    const users = await store.readAll<UserV2>();
    for (const user of users) {
      const userV3 = {
        ...user,
        shortname: `${user.firstname.substring(0, 3)}${user.lastname.substring(0, 3)}`,
      };
      // eslint-disable-next-line no-await-in-loop
      await store.update<UserV3>(userV3);
    }
  },
  down: async (store: IStore) => {
    const users = await store.readAll<UserV3>();
    for (const user of users) {
      // eslint-disable-next-line no-await-in-loop
      await store.replace<UserV2>({
        id: user.id,
        firstname: user.firstname,
        lastname: user.lastname,
        fullname: user.fullname,
      });
    }
  },
};
