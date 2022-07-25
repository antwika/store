import { ConsoleLogger } from '@antwika/common';
import { ReadPreferringLockPolicy, Lock } from '@antwika/lock';
import { ILockablePartitionStore } from '../src/ILockablePartitionStore';
import { IStore } from '../src/IStore';
import { LockablePartitionStore } from '../src/LockablePartitionStore';
import { MemoryStore } from '../src/MemoryStore';
import { MemoryPartitionStore } from '../src/MemoryPartitionStore';
import { IPartitionStore } from '../src/IPartitionStore';
import { Ticket } from '../src/LockableStore';

type TestResource = { foo: string };

describe('LockablePartitionStore', () => {
  let ticketStore: IStore;
  let lockableStore: ILockablePartitionStore;
  let store: IPartitionStore;

  beforeEach(() => {
    const logger = new ConsoleLogger('debug');
    const lockPolicy = new ReadPreferringLockPolicy(logger);
    const lock = new Lock(logger, lockPolicy);
    ticketStore = new MemoryStore();
    store = new MemoryPartitionStore();
    lockableStore = new LockablePartitionStore(logger, lock, ticketStore, store);
  });

  describe('acquireTicket', () => {
    it('throws if provided an invalid ticket', async () => {
      await expect(() => lockableStore.acquireTicket('INVALID_TICKET_TYPE' as any)).rejects.toThrowError('Invalid ticket type provided.');
    });

    it('can acquire and return a READ ticket for reading', async () => {
      const ticket = await lockableStore.acquireTicket('READ');
      await expect(lockableStore.returnTicket(ticket)).resolves.toBeUndefined();
    });

    it('can acquire and return a WRITE ticket for writing', async () => {
      const ticket = await lockableStore.acquireTicket('WRITE');
      await expect(lockableStore.returnTicket(ticket)).resolves.toBeUndefined();
    });
  });

  describe('returnTicket', () => {
    it('throws if provided an invalid ticket', async () => {
      await expect(() => lockableStore.returnTicket('invalid-ticket')).rejects.toThrowError('Invalid ticket');
    });

    it('throws if a ticket is found, but has an invalid type', async () => {
      const { id: ticketId } = await ticketStore.createWithoutId<Ticket>({ type: 'INVALID_TICKET_TYPE' as any });
      await expect(() => lockableStore.returnTicket(ticketId)).rejects.toThrowError('Invalid ticket');
    });

    it('can consume a valid READ ticket', async () => {
      const ticketId = await lockableStore.acquireTicket('READ');
      await expect(lockableStore.returnTicket(ticketId)).resolves.toBeUndefined();
    });

    it('can consume a valid WRITE ticket', async () => {
      const ticketId = await lockableStore.acquireTicket('WRITE');
      await expect(lockableStore.returnTicket(ticketId)).resolves.toBeUndefined();
    });
  });

  describe('connect', () => {
    it('throws if provided an invalid ticket', async () => {
      await expect(() => lockableStore.connect('invalid-ticket')).rejects.toThrowError('Invalid ticket');
    });

    it('throws if a READ ticket is used', async () => {
      const ticketId = await lockableStore.acquireTicket('READ');
      await expect(() => lockableStore.connect(ticketId)).rejects.toThrowError('Invalid ticket');
    });

    it('can connect to a store after acquiring a WRITE ticket', async () => {
      const ticket = await lockableStore.acquireTicket('WRITE');
      await expect(lockableStore.connect(ticket)).resolves.toBeUndefined();
      await expect(lockableStore.returnTicket(ticket)).resolves.toBeUndefined();
    });
  });

  describe('disconnect', () => {
    it('throws if provided an invalid ticket', async () => {
      await expect(() => lockableStore.disconnect('invalid-ticket')).rejects.toThrowError('Invalid ticket');
    });

    it('throws if a READ ticket is used', async () => {
      const ticketId = await lockableStore.acquireTicket('READ');
      await expect(() => lockableStore.disconnect(ticketId)).rejects.toThrowError('Invalid ticket');
    });

    it('can disconnect from a store after acquiring a WRITE ticket', async () => {
      const ticket = await lockableStore.acquireTicket('WRITE');
      await expect(lockableStore.disconnect(ticket)).resolves.toBeUndefined();
      await expect(lockableStore.returnTicket(ticket)).resolves.toBeUndefined();
    });
  });

  describe('createWithoutId', () => {
    it('throws if provided an invalid ticket', async () => {
      await expect(() => lockableStore.createWithoutId<TestResource>('invalid-ticket', { name: 'test' }, { foo: 'bar' })).rejects.toThrowError('Invalid ticket');
    });

    it('throws if a READ ticket is used', async () => {
      const testResource = { foo: 'bar' };
      const ticketId = await lockableStore.acquireTicket('READ');
      await expect(() => lockableStore.createWithoutId<TestResource>(ticketId, { name: 'test' }, testResource)).rejects.toThrowError('Invalid ticket');
    });

    it('can create a new resource in a store after acquiring a WRITE ticket', async () => {
      const testResource = { foo: 'bar' };
      const ticket = await lockableStore.acquireTicket('WRITE');
      await expect(lockableStore.createWithoutId<TestResource>(ticket, { name: 'test' }, testResource))
        .resolves.toStrictEqual({
          ...testResource,
          id: expect.any(String),
        });
      await expect(lockableStore.returnTicket(ticket)).resolves.toBeUndefined();
    });
  });

  describe('read', () => {
    it('throws if provided an invalid ticket', async () => {
      await expect(() => lockableStore.read<TestResource>('invalid-ticket', { name: 'test' }, 'an id')).rejects.toThrowError('Invalid ticket');
    });

    it('can read an existing resource from a store after acquiring a READ ticket', async () => {
      const testResource = { foo: 'bar' };

      const { id } = await store.createWithoutId<TestResource>({ name: 'test' }, testResource);

      const ticket = await lockableStore.acquireTicket('READ');
      await expect(lockableStore.read<TestResource>(ticket, { name: 'test' }, id))
        .resolves.toStrictEqual({
          ...testResource,
          id: expect.any(String),
        });
      await expect(lockableStore.returnTicket(ticket)).resolves.toBeUndefined();
    });

    it('can read an existing resource from a store after acquiring a WRITE ticket', async () => {
      const testResource = { foo: 'bar' };

      const { id } = await store.createWithoutId<TestResource>({ name: 'test' }, testResource);

      const ticket = await lockableStore.acquireTicket('WRITE');
      await expect(lockableStore.read<TestResource>(ticket, { name: 'test' }, id))
        .resolves.toStrictEqual({
          ...testResource,
          id: expect.any(String),
        });
      await expect(lockableStore.returnTicket(ticket)).resolves.toBeUndefined();
    });
  });

  describe('readAll', () => {
    it('throws if provided an invalid ticket', async () => {
      await expect(() => lockableStore.readAll<TestResource>('invalid-ticket', { name: 'test' })).rejects.toThrowError('Invalid ticket');
    });

    it('can read all resources from a store after acquiring a READ ticket', async () => {
      const testResource = { foo: 'bar' };

      await store.createWithoutId<TestResource>({ name: 'test' }, testResource);

      const ticket = await lockableStore.acquireTicket('READ');
      await expect(lockableStore.readAll<TestResource>(ticket, { name: 'test' }))
        .resolves.toStrictEqual([{
          ...testResource,
          id: expect.any(String),
        }]);
      await expect(lockableStore.returnTicket(ticket)).resolves.toBeUndefined();
    });

    it('can read all resources from a store after acquiring a WRITE ticket', async () => {
      const testResource = { foo: 'bar' };

      await store.createWithoutId<TestResource>({ name: 'test' }, testResource);

      const ticket = await lockableStore.acquireTicket('WRITE');
      await expect(lockableStore.readAll<TestResource>(ticket, { name: 'test' }))
        .resolves.toStrictEqual([{
          ...testResource,
          id: expect.any(String),
        }]);
      await expect(lockableStore.returnTicket(ticket)).resolves.toBeUndefined();
    });
  });

  describe('update', () => {
    it('throws if provided an invalid ticket', async () => {
      await expect(() => lockableStore.update<TestResource>('invalid-ticket', { name: 'test' }, { id: 'an id', foo: 'baz' })).rejects.toThrowError('Invalid ticket');
    });

    it('throws if a READ ticket is used', async () => {
      const testResource = { foo: 'bar' };

      const { id } = await store.createWithoutId<TestResource>({ name: 'test' }, testResource);

      const ticketId = await lockableStore.acquireTicket('READ');
      await expect(() => lockableStore.update<TestResource>(ticketId, { name: 'test' }, { id, foo: 'baz' })).rejects.toThrowError('Invalid ticket');
    });

    it('can update an existing resource in a store after acquiring a WRITE ticket', async () => {
      const testResource = { foo: 'bar' };

      const { id } = await store.createWithoutId<TestResource>({ name: 'test' }, testResource);

      const ticket = await lockableStore.acquireTicket('WRITE');
      await expect(lockableStore.update<TestResource>(ticket, { name: 'test' }, { id, foo: 'baz' })).resolves.toBeUndefined();
      await expect(lockableStore.read<TestResource>(ticket, { name: 'test' }, id))
        .resolves.toStrictEqual({
          foo: 'baz',
          id: expect.any(String),
        });
      await expect(lockableStore.returnTicket(ticket)).resolves.toBeUndefined();
    });
  });

  describe('delete', () => {
    it('throws if provided an invalid ticket', async () => {
      await expect(() => lockableStore.delete('invalid-ticket', { name: 'test' }, 'an id')).rejects.toThrowError('Invalid ticket');
    });

    it('throws if a READ ticket is used', async () => {
      const testResource = { foo: 'bar' };

      const { id } = await store.createWithoutId<TestResource>({ name: 'test' }, testResource);

      const ticketId = await lockableStore.acquireTicket('READ');
      await expect(() => lockableStore.delete(ticketId, { name: 'test' }, id)).rejects.toThrowError('Invalid ticket');
    });

    it('can delete an existing resource from a store after acquiring a WRITE ticket', async () => {
      const testResource = { foo: 'bar' };

      const { id } = await store.createWithoutId<TestResource>({ name: 'test' }, testResource);

      const ticket = await lockableStore.acquireTicket('WRITE');
      await expect(lockableStore.delete(ticket, { name: 'test' }, id)).resolves.toBeUndefined();
      await expect(lockableStore.read<TestResource>(ticket, { name: 'test' }, id)).rejects.toThrowError('Could not find data by id');
      await expect(lockableStore.returnTicket(ticket)).resolves.toBeUndefined();
    });
  });
});
