import { ILogger } from '@antwika/common';
import { Lock } from '@antwika/lock';
import { DataId, IStore, WithId } from './IStore';
import { ILockableStore } from './ILockableStore';

export type TicketId = string;

export type TicketType = 'READ' | 'WRITE';

export type Ticket = {
  type: TicketType,
};

export class LockableStore implements ILockableStore {
  private readonly logger: ILogger;

  private readonly lock: Lock;

  private readonly tickets: IStore;

  private readonly store: IStore;

  /**
   * A wrapper that enforces locking of a store. It returns a ticket once a lock has been
   * successfully acquired. The ticket can then be used for accessing the methods of the store.
   * Finally the ticket can be returned in order to release the lock.
   *
   * @param logger A logger for output
   * @param store The store that is locked before access/operations.
   */
  constructor(logger: ILogger, lock: Lock, tickets: IStore, store: IStore) {
    this.logger = logger;
    this.lock = lock;
    this.tickets = tickets;
    this.store = store;
  }

  /**
   * Acquire a lock for the store.
   *
   * @returns A ticket to be used for accessing the store.
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
   * Releases the store lock.
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

  async createWithoutId<T>(ticketId: TicketId, data: T): Promise<WithId<T>> {
    const ticket = await this.checkTicket(['WRITE'], ticketId);
    this.logger.debug(`Forwarding createWithoutId(...) using lock[ticketId: ${ticket.id}]...`);
    return this.store.createWithoutId<T>(data);
  }

  async read<T>(ticketId: TicketId, id: DataId): Promise<WithId<T>> {
    const ticket = await this.checkTicket(['READ', 'WRITE'], ticketId);
    this.logger.debug(`Forwarding read(...) using lock[ticketId: ${ticket.id}]...`);
    return this.store.read<T>(id);
  }

  async readAll<T>(ticketId: TicketId): Promise<WithId<T>[]> {
    const ticket = await this.checkTicket(['READ', 'WRITE'], ticketId);
    this.logger.debug(`Forwarding readAll(...) using lock[ticketId: ${ticket.id}]...`);
    return this.store.readAll<T>();
  }

  async update<T>(ticketId: TicketId, data: WithId<T>) {
    const ticket = await this.checkTicket(['WRITE'], ticketId);
    this.logger.debug(`Forwarding update(...) using lock[ticketId: ${ticket.id}]...`);
    this.store.update(data);
  }

  async delete(ticketId: TicketId, id: DataId) {
    const ticket = await this.checkTicket(['WRITE'], ticketId);
    this.logger.debug(`Forwarding delete(...) using lock[ticketId: ${ticket.id}]...`);
    this.store.delete(id);
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
