import { MongoMemoryServer } from 'mongodb-memory-server';
import { IPartitionStore } from '../src/IPartitionStore';
import { MongoDbPartitionStore } from '../src/MongoDbPartitionStore';

describe('MongoDbPartitionStore', () => {
  let mockMongoDb: MongoMemoryServer;
  let connectionUri: string;
  let store: IPartitionStore;

  beforeAll(async () => {
    mockMongoDb = await MongoMemoryServer.create({
      instance: {
        dbName: 'testdb',
      },
      auth: {
        extraUsers: [
          {
            createUser: 'testuser',
            pwd: 'testpass',
            roles: [],
            database: 'testdb',
          },
        ],
      },
    });
    connectionUri = mockMongoDb.getUri();
  });

  afterAll(async () => {
    await mockMongoDb.stop();
  });

  beforeEach(async () => {
    const match = connectionUri.match(/:\/\/(127.0.0.1(?::\d+)*)\//);
    if (!match) throw new Error('Failed to extract "cluster" from mongodb uri');

    const cluster = match[1];

    store = new MongoDbPartitionStore({
      protocol: 'mongodb',
      username: 'testuser',
      password: 'testpass',
      cluster,
      database: 'testdb',
      flags: 'retryWrites=true&w=majority',
    });

    await store.connect();
  });

  afterEach(async () => {
    jest.resetAllMocks();
    await store.disconnect();
  });

  it('throws when trying to get a non-existant data id', async () => {
    await expect(store.read({ name: 'partition' }, 'deadbeefdeadbeefdeadbeef')).rejects.toThrow('Could not find data by id');
  });

  it('throws when trying to delete a non-existant data id', async () => {
    await expect(store.delete({ name: 'partition' }, 'deadbeefdeadbeefdeadbeef')).rejects.toThrow('Could not delete non-existant data');
  });

  it('can write, read, update and delete documents from the store', async () => {
    type TestData = { name: string };

    const w1 = await store.createWithoutId<TestData>({ name: 'partition' }, { name: 'My item 1' });
    const w2 = await store.createWithoutId<TestData>({ name: 'partition' }, { name: 'My item 2' });
    expect(w1.id).toBeDefined();
    expect(w1.id).toHaveLength(24);
    expect(w2.id).toBeDefined();
    expect(w2.id).toHaveLength(24);
    expect(w1.id).not.toBe(w2.id);
    expect(w1.name).toBe('My item 1');
    expect(w2.name).toBe('My item 2');

    const readAll1 = await store.readAll<TestData>({ name: 'partition' });
    expect(readAll1).toHaveLength(2);

    const r1 = await store.read<TestData>({ name: 'partition' }, w1.id);
    const r2 = await store.read<TestData>({ name: 'partition' }, w2.id);
    expect(r1.id).toBe(w1.id);
    expect(r2.id).toBe(w2.id);

    r1.name = 'My updated item 1';
    r2.name = 'My updated item 2';
    await store.update<TestData>({ name: 'partition' }, r1);
    await store.update<TestData>({ name: 'partition' }, r2);
    const u1 = await store.read<TestData>({ name: 'partition' }, r1.id);
    const u2 = await store.read<TestData>({ name: 'partition' }, r2.id);
    expect(u1.name).toBe('My updated item 1');
    expect(u2.name).toBe('My updated item 2');

    const readAll2 = await store.readAll<TestData>({ name: 'partition' });
    expect(readAll2).toHaveLength(2);

    await store.delete({ name: 'partition' }, r1.id);
    await store.delete({ name: 'partition' }, r2.id);

    const readAll3 = await store.readAll<TestData>({ name: 'partition' });
    expect(readAll3).toHaveLength(0);
  });

  it('can write to and read from multiple partitions.', async () => {
    type TestData = { name: string };

    await store.createWithoutId<TestData>({ name: 'partition1' }, { name: 'Record 1' });
    await store.createWithoutId<TestData>({ name: 'partition2' }, { name: 'Record 2' });

    const partition1Records = await store.readAll<TestData>({ name: 'partition1' });
    const partition2Records = await store.readAll<TestData>({ name: 'partition2' });

    expect(partition1Records).toHaveLength(1);
    expect(partition1Records[0].name).toBe('Record 1');
    expect(partition2Records).toHaveLength(1);
    expect(partition2Records[0].name).toBe('Record 2');
  });
});
