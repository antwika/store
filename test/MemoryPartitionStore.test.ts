import { IPartitionStore } from '../src/IPartitionStore';
import { MemoryPartitionStore } from '../src/MemoryPartitionStore';

describe('MemoryPartitionStore', () => {
  let store: IPartitionStore;

  beforeEach(async () => {
    store = new MemoryPartitionStore();
    await store.connect();
  });

  afterEach(async () => {
    jest.resetAllMocks();
    await store.disconnect();
  });

  it('throws when trying to read a record from a non-existent partition.', async () => {
    await expect(store.read({ name: 'partition' }, 'null')).rejects.toThrow('Partition does not exist in store');
  });

  it('throws when trying to delete a record from a non-existent partition.', async () => {
    await expect(store.delete({ name: 'partition' }, 'null')).rejects.toThrow('Partition does not exist in store');
  });

  it('can write, read, update and delete documents from the store', async () => {
    type TestData = { name: string; };

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

  it('throws when trying to read non-existent data from an existing partition.', async () => {
    type TestData = { name: string; };
    const record = await store.createWithoutId<TestData>({ name: 'partition' }, { name: 'My item 1' });
    await store.delete({ name: 'partition' }, record.id);
    await expect(() => store.read<TestData>({ name: 'partition' }, record.id)).rejects.toThrowError('Could not find data by id');
  });

  it('throws when trying to read all from a non-existent partition.', async () => {
    type TestData = { name: string; };
    await expect(() => store.readAll<TestData>({ name: 'partition' })).rejects.toThrowError('Partition does not exist in store');
  });

  it('throws when trying to update a record in a non-existent partition.', async () => {
    type TestData = { name: string; };
    const record = await store.createWithoutId<TestData>({ name: 'partition' }, { name: 'My item 1' });
    await store.delete({ name: 'partition' }, record.id);
    await expect(() => store.update<TestData>({ name: 'other-partition' }, record)).rejects.toThrowError('Partition does not exist in store');
  });

  it('throws when trying to delete non-existent data from an existing partition.', async () => {
    type TestData = { name: string; };
    const record = await store.createWithoutId<TestData>({ name: 'partition' }, { name: 'My item 1' });
    await store.delete({ name: 'partition' }, record.id);
    await expect(() => store.delete({ name: 'partition' }, record.id)).rejects.toThrowError('Could not delete non-existant data');
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
