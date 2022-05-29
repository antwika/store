import { MongoDbStore } from '../src/MongoDbStore';

describe('HttpRoute', () => {
  let store: MongoDbStore;

  beforeEach(() => {
    store = new MongoDbStore({
      username: undefined,
      password: undefined,
      cluster: 'localhost:27017',
      database: 'auth-api',
      collection: 'clients',
    });
  });

  afterEach(async () => {
    jest.resetAllMocks();
    await store.disconnect();
  });

  it('throws when trying to get a non-existant data id', async () => {
    await expect(store.get('null')).rejects.toThrow('Could not find data by id');
  });

  it('throws when trying to delete a non-existant data id', async () => {
    await expect(store.delete('null')).rejects.toThrow('Could not delete non-existant data');
  });

  it('can write, get and delete data from store', async () => {
    const testData = { id: 'abc' };
    const written = await store.write(testData);
    const gotData = await store.get(written.id);
    const deleted = await store.delete(gotData.id);

    expect(deleted).toBe(true);
  });
});
