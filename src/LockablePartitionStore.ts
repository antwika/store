import { DataId, WithId } from './IStore';
import { IPartitionStore, Partition } from './IPartitionStore';
import { ILockablePartitionStore } from './ILockablePartitionStore';
import { TicketId } from './LockableStore';
import { ConnectedStore } from './ConnectedStore';

export class LockablePartitionStore extends ConnectedStore<IPartitionStore>
  implements ILockablePartitionStore {
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
