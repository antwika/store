import { ILogger } from '@antwika/common';
import { Lock, TicketId, TicketLock } from '@antwika/lock';
import { IPartitionStore } from './IPartitionStore';
import { IStore } from './IStore';

export class ConnectedPartitionStore extends TicketLock {
  protected readonly store: IPartitionStore;

  /**
   * A wrapper that enforces locking of a store. It returns a ticket once a lock has been
   * successfully acquired. The ticket can then be used for accessing the methods of the store.
   * Finally the ticket can be returned in order to release the lock.
   *
   * @param logger A logger for output
   * @param store The store that is locked before access/operations.
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
}
