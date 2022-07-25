import { ILogger } from '@antwika/common';
import { Lock, TicketLock } from '@antwika/lock';
import { DataId, IStore, WithId } from './IStore';
import { IPartitionStore, Partition } from './IPartitionStore';
import { ILockablePartitionStore } from './ILockablePartitionStore';
import { TicketId } from './LockableStore';

export class LockablePartitionStore extends TicketLock implements ILockablePartitionStore {
  private readonly store: IPartitionStore;

  /**
   * A wrapper that enforces locking of a partition store. It returns a ticket once a lock has been
   * successfully acquired. The ticket can then be used for accessing the methods of the store.
   * Finally the ticket can be returned in order to release the lock.
   *
   * @param logger A logger for output
   * @param store The partition store that is locked before access/operations.
   */
  constructor(logger: ILogger, lock: Lock, tickets: IStore, store: IPartitionStore) {
    super(logger, lock, tickets);
    this.store = store;
  }

  async connect(ticketId: TicketId) {
    const ticket = await this.checkTicket(['WRITE'], ticketId);
    this.logger.debug(`Connecting to Store using lock[ticketId: ${ticket.id}]...`);
    return this.store.connect();
  }

  async disconnect(ticketId: TicketId) {
    const ticket = await this.checkTicket(['WRITE'], ticketId);
    this.logger.debug(`Disconnecting from Store using lock[ticketId: ${ticket.id}]...`);
    return this.store.disconnect();
  }

  async createWithoutId<T>(ticketId: TicketId, partition: Partition, data: T): Promise<WithId<T>> {
    const ticket = await this.checkTicket(['WRITE'], ticketId);
    this.logger.debug(`Forwarding createWithoutId(...) using lock[ticketId: ${ticket.id}]...`);
    return this.store.createWithoutId<T>(partition, data);
  }

  async read<T>(ticketId: TicketId, partition: Partition, id: DataId): Promise<WithId<T>> {
    const ticket = await this.checkTicket(['READ', 'WRITE'], ticketId);
    this.logger.debug(`Forwarding read(...) using lock[ticketId: ${ticket.id}]...`);
    return this.store.read<T>(partition, id);
  }

  async readAll<T>(ticketId: TicketId, partition: Partition): Promise<WithId<T>[]> {
    const ticket = await this.checkTicket(['READ', 'WRITE'], ticketId);
    this.logger.debug(`Forwarding readAll(...) using lock[ticketId: ${ticket.id}]...`);
    return this.store.readAll<T>(partition);
  }

  async update<T>(ticketId: TicketId, partition: Partition, data: WithId<T>) {
    const ticket = await this.checkTicket(['WRITE'], ticketId);
    this.logger.debug(`Forwarding update(...) using lock[ticketId: ${ticket.id}]...`);
    this.store.update(partition, data);
  }

  async delete(ticketId: TicketId, partition: Partition, id: DataId) {
    const ticket = await this.checkTicket(['WRITE'], ticketId);
    this.logger.debug(`Forwarding delete(...) using lock[ticketId: ${ticket.id}]...`);
    this.store.delete(partition, id);
  }
}
