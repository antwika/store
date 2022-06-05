import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongoDbStore } from '../src/MongoDbStore';

describe('HttpRoute', () => {
  let mockMongoDb: MongoMemoryServer;
  let connectionUri: string;
  let store: MongoDbStore;

  beforeAll(async () => {
    mockMongoDb = await MongoMemoryServer.create();
    connectionUri = mockMongoDb.getUri();
  });

  afterAll(async () => {
    await mockMongoDb.stop();
  });

  beforeEach(() => {
    const match = connectionUri.match(/:\/\/(127.0.0.1(?::\d+)*)\//);
    if (!match) throw new Error('Failed to extract "cluster" from mongodb uri');

    const cluster = match[1];

    store = new MongoDbStore({
      username: undefined,
      password: undefined,
      cluster,
      database: 'auth-api',
      collection: 'clients',
    });
  });

  beforeEach(async () => {
    await store.connect();
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
