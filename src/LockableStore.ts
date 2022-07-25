import { DataId, WithId } from './IStore';
import { ILockableStore } from './ILockableStore';
import { ConnectedStore } from './ConnectedStore';

export type TicketId = string;

export type TicketType = 'READ' | 'WRITE';

export type Ticket = {
  type: TicketType,
};

export class LockableStore extends ConnectedStore implements ILockableStore {
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
