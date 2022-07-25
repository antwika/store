import { ILogger } from '@antwika/common';
import { TicketLock, Lock } from '@antwika/lock';
import { DataId, IStore, WithId } from './IStore';
import { ILockableStore } from './ILockableStore';

export type TicketId = string;

export type TicketType = 'READ' | 'WRITE';

export type Ticket = {
  type: TicketType,
};

export class LockableStore extends TicketLock implements ILockableStore {
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
}
