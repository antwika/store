import { ILogger } from '@antwika/common';
import { Lock } from '@antwika/lock';
import { DataId, IStore, WithId } from './IStore';
import { IPartitionStore, Partition } from './IPartitionStore';
import { ILockablePartitionStore } from './ILockablePartitionStore';
import { Ticket, TicketId, TicketType } from './LockableStore';

export class LockablePartitionStore implements ILockablePartitionStore {
  private readonly logger: ILogger;

  private readonly lock: Lock;

  private readonly tickets: IStore;

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
    this.logger = logger;
    this.lock = lock;
    this.tickets = tickets;
    this.store = store;
  }

  /**
   * Acquire a lock for the partition store.
   *
   * @returns A ticket to be used for accessing the partition store.
   */
  async acquireTicket(ticketType: TicketType) {
    switch (ticketType) {
      case 'READ': await this.lock.beginRead(); break;
      case 'WRITE': await this.lock.beginWrite(); break;
      default: throw new Error('Invalid ticket type provided.');
    }

    const { id } = await this.tickets.createWithoutId<Ticket>({ type: ticketType });
    this.logger.debug(`Acquired lock[ticketId: ${id}]!`);

    return id;
  }

  /**
   * Releases the partition store lock.
   */
  async returnTicket(ticketId: TicketId): Promise<void> {
    const ticket = await this.checkTicket(['READ', 'WRITE'], ticketId);
    this.logger.debug(`Awaiting release of lock[ticketId: ${ticket.id}]...`);

    if (ticket.type === 'READ') await this.lock.endRead();
    if (ticket.type === 'WRITE') await this.lock.endWrite();

    await this.tickets.delete(ticket.id);
    this.logger.debug(`Released lock[ticketId: ${ticket.id}]!`);
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

  private async checkTicket(ticketTypes: TicketType[], ticketId: TicketId) {
    try {
      const ticket = await this.tickets.read<Ticket>(ticketId);
      if (!ticketTypes.includes(ticket.type)) throw new Error('Invalid ticket type');
      return ticket;
    } catch (err) {
      this.logger.warning('Attempted to use an invalid ticket with store!');
      throw new Error('Invalid ticket');
    }
  }
}
