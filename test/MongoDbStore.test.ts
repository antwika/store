import { MongoMemoryServer } from 'mongodb-memory-server';
import { IStore } from '../src/IStore';
import { MongoDbStore } from '../src/MongoDbStore';

describe('MongoDbStore', () => {
  let mockMongoDb: MongoMemoryServer;
  let connectionUri: string;
  let store: IStore;

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

    store = new MongoDbStore({
      protocol: 'mongodb',
      username: 'testuser',
      password: 'testpass',
      cluster,
      database: 'testdb',
      collection: 'testcollection',
      flags: 'retryWrites=true&w=majority',
    });

    await store.connect();
  });

  afterEach(async () => {
    jest.resetAllMocks();
    await store.disconnect();
  });

  it('throws when trying to get a non-existant data id', async () => {
    await expect(store.read('null')).rejects.toThrow('Could not find data by id');
  });

  it('throws when trying to delete a non-existant data id', async () => {
    await expect(store.delete('null')).rejects.toThrow('Could not delete non-existant data');
  });

  it('can write, read, update and delete documents from the store', async () => {
    type TestData = {
      name: string;
    };

    const w1 = await store.createWithoutId<TestData>({ name: 'My item 1' });
    const w2 = await store.createWithoutId<TestData>({ name: 'My item 2' });
    expect(w1.id).toBeDefined();
    expect(w1.id).toHaveLength(24);
    expect(w2.id).toBeDefined();
    expect(w2.id).toHaveLength(24);
    expect(w1.id).not.toBe(w2.id);
    expect(w1.name).toBe('My item 1');
    expect(w2.name).toBe('My item 2');

    const readAll1 = await store.readAll<TestData>();
    expect(readAll1).toHaveLength(2);

    const r1 = await store.read<TestData>(w1.id);
    const r2 = await store.read<TestData>(w2.id);
    expect(r1.id).toBe(w1.id);
    expect(r2.id).toBe(w2.id);

    r1.name = 'My updated item 1';
    r2.name = 'My updated item 2';
    await store.update<TestData>(r1);
    await store.update<TestData>(r2);
    const u1 = await store.read<TestData>(r1.id);
    const u2 = await store.read<TestData>(r2.id);
    expect(u1.name).toBe('My updated item 1');
    expect(u2.name).toBe('My updated item 2');

    const readAll2 = await store.readAll<TestData>();
    expect(readAll2).toHaveLength(2);

    await store.delete(r1.id);
    await store.delete(r2.id);

    const readAll3 = await store.readAll<TestData>();
    expect(readAll3).toHaveLength(0);
  });

  /**
   * @deprecated
   */
  it('(DEPRECATED) can write (with id provided), read, update and delete documents from the store (test variant 1).', async () => {
    type TestData = {
      name: string;
    };

    const w1 = await store.create<TestData>({ id: 'item1', name: 'My item 1' });
    const w2 = await store.create<TestData>({ id: 'item2', name: 'My item 2' });
    expect(w1.id).toBeDefined();
    expect(w1.id).toHaveLength(24);
    expect(w2.id).toBeDefined();
    expect(w2.id).toHaveLength(24);
    expect(w1.id).not.toBe(w2.id);
    expect(w1.name).toBe('My item 1');
    expect(w2.name).toBe('My item 2');

    const readAll1 = await store.readAll<TestData>();
    expect(readAll1).toHaveLength(2);

    const r1 = await store.read<TestData>(w1.id);
    const r2 = await store.read<TestData>('item2');
    expect(r1.id).toBe(w1.id);
    expect(r2.id).toBe(w2.id);

    r1.name = 'My updated item 1';
    r2.id = 'item2';
    r2.name = 'My updated item 2';
    await store.update<TestData>(r1);
    await store.update<TestData>(r2);
    const u1 = await store.read<TestData>(r1.id);
    const u2 = await store.read<TestData>(r2.id);
    expect(u1.name).toBe('My updated item 1');
    expect(u2.name).toBe('My updated item 2');

    const readAll2 = await store.readAll<TestData>();
    expect(readAll2).toHaveLength(2);

    await store.delete(r1.id);
    await store.delete('item2');

    const readAll3 = await store.readAll<TestData>();
    expect(readAll3).toHaveLength(0);
  });

  /**
   * @deprecated
   */
  it('(DEPRECATED) can write (with id provided), read, update and delete documents from the store (test variant 2).', async () => {
    type TestData = {
      name: string;
    };

    const w1 = await store.create<TestData>({ id: 'item1', name: 'My item 1' });
    const w2 = await store.create<TestData>({ id: 'item2', name: 'My item 2' });
    // expect(w1.id).toBe('item1');
    // expect(w2.id).toBe('item2');
    expect(w1.name).toBe('My item 1');
    expect(w2.name).toBe('My item 2');

    const readAll1 = await store.readAll<TestData>();
    expect(readAll1).toHaveLength(2);

    const r1 = await store.read<TestData>(w1.id);
    const r2 = await store.read<TestData>(w2.id);
    // expect(r1.id).toBe('item1');
    // expect(r2.id).toBe('item2');

    r1.name = 'My updated item 1';
    r2.name = 'My updated item 2';
    await store.update<TestData>(r1);
    await store.update<TestData>(r2);
    const u1 = await store.read<TestData>(r1.id);
    const u2 = await store.read<TestData>(r2.id);
    expect(u1.name).toBe('My updated item 1');
    expect(u2.name).toBe('My updated item 2');

    const readAll2 = await store.readAll<TestData>();
    expect(readAll2).toHaveLength(2);

    await store.delete(r1.id);
    await store.delete(r2.id);

    const readAll3 = await store.readAll<TestData>();
    expect(readAll3).toHaveLength(0);
  });
});
